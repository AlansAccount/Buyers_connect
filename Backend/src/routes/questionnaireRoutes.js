import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
	getQuestionnaireDraft,
	submitQuestionnaire,
	checkIfQuestionnaireComplete,
	checkQuestionnaireReminder,
} from "../controllers/questionnaireControllers.js";
import pool from "../config/db.js";
import { sendEmail } from "../config/email.js";

console.log("🧩 questionnaireRoutes file loaded");

const router = express.Router();

router.get("/", protect, getQuestionnaireDraft);

router.post("/", protect, submitQuestionnaire);

router.patch("/", protect, async (req, res) => {
	const {
		budget,
		location,
		owns_property,
		property_main_type,
		property_sub_type,
		is_international,
		country,
		city,
		mortgage_status,
		purchase_timeline,
		goals,
		importance_rank,
		experience_rating,
		feedback,
		is_completed, // true or false depending on submit or save
	} = req.body;

	const userId = req.user.id;

	const query = `
	INSERT INTO buyer_questionnaires (
		user_id, budget, location,
		owns_property, property_main_type, property_sub_type,
		is_international, country, city, mortgage_status,
		purchase_timeline, goals, importance_rank, experience_rating,
		feedback, is_completed, last_updated
	)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
	ON CONFLICT (user_id)
	DO UPDATE SET
		budgetn = $2, location = $3,
		owns_property = $4, property_main_type = $5, property_sub_type = $6,
		is_international = $7, country = $8, city = $9, mortgage_status = $10,
		purchase_timeline = $11, goals = $12, importance_rank = $13, experience_rating = $14,
		feedback = $15, is_completed = $16, last_updated = CURRENT_TIMESTAMP
	RETURNING *;
	`;

	const values = [
		userId,
		budget,
		location,
		owns_property,
		property_main_type,
		property_sub_type,
		is_international,
		country,
		city,
		mortgage_status,
		purchase_timeline,
		goals,
		importance_rank,
		experience_rating,
		feedback,
		is_completed,
	];

	const check = await pool.query(
		"SELECT is_completed FROM buyer_questionnaires WHERE user_id = $1",
		[userId]
	);

	if (
		check.rows.length &&
		check.rows[0].is_completed === true &&
		!is_completed
	) {
		return res.status(400).json({
			message:
				"Cannot save draft. You have already submitted this questionnaire.",
		});
	}

	const { rows } = await pool.query(query, values);

	res.status(200).json(rows[0]);
});

// GET requests
router.get("/check", protect, checkIfQuestionnaireComplete);

router.get("/reminder", protect, checkQuestionnaireReminder);

router.get("/submissions", protect, async (req, res) => {
	const userId = req.user.id;

	const result = await pool.query(
		"SELECT * FROM questionnaire_submissions WHERE user_id = $1 ORDER BY version_number DESC",
		[userId]
	);

	console.log("📦 submissions found:", result.rows); // 🧪 Add this
	res.status(200).json(result.rows);
});

// Soft-delete a questionnaire
router.delete("/:id", protect, async (req, res) => {
	const userId = req.user.id;
	const formId = req.params.id;

	try {
		const check = await pool.query(
			`SELECT * FROM buyer_questionnaires WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
			[formId, userId]
		);

		if (check.rows.length === 0) {
			return res
				.status(404)
				.json({ message: "Questionnaire not found or already deleted." });
		}

		await pool.query(
			`UPDATE buyer_questionnaires
			 SET deleted_at = NOW(), is_active = false
			 WHERE id = $1`,
			[formId]
		);

		res.status(200).json({ message: "Questionnaire soft-deleted." });
	} catch (err) {
		console.error("Delete error: ", err.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

router.post("/:id/email", protect, async (req, res) => {
	const userId = req.user.id;
	const formId = req.params.id;

	try {
		// Step 1. Fetch the form.
		const { rows } = await pool.query(
			"SELECT * FROM questionnaire_submissions WHERE id = $1 AND user_id = $2",
			[formId, userId]
		);

		if (rows.length === 0) {
			return res.status(404).json({ message: "Form not found." });
		}

		const form = rows[0];

		// Step 2: Fetch user email.
		const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [
			userId,
		]);
		const userEmail = userRes.rows[0]?.email;

		if (!userEmail) {
			return res.status(400).json({ message: "User email not found." });
		}

		//Step 3: Compose email.
		const subject = `Your Buyer Questionnaire - ID: #${formId}`;
		const body = `
			Hello,

			Here are your questionnaire details:

			Budget: $${form.budget}
			Location: ${form.location}
			Type: ${form.property_main_type} / ${form.property_sub_type}
			Timeline: ${form.purchase_timeline}
			Mortgage: ${form.mortgage_status}
			Goals: ${form.goals?.join(", ")}
			Importance: ${form.importance_rank?.join(", ")}
			Experience: ${form.experience_rating}
			Feedback: ${form.feedback}

			Thanks,
			Buyers Connect
		`;

		// Step 4: Send via Mailgun.
		await sendEmail(userEmail, subject, body); // make sure sendEmail is imported

		res.status(200).json({ message: "Email sent." });
	} catch (err) {
		console.error("Email error: ", err);
		res.status(500).json({ message: "Error sending email." });
	}
});

export default router;
