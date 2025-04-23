import pool from "../config/db.js";
import asyncHandler from "express-async-handler";
import { maxBuyerSubmissions } from "../config/matchConfig.js";
import scoreAgent from "../services/matchmakingService.js";

export const submitQuestionnaire = asyncHandler(async (req, res) => {
	try {
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
		} = req.body;

		const userId = req.user.id;

		const maxAllowedForms = 2; // Make this confirgurable later
		const activeFormsRes = await pool.query(
			`SELECT COUNT(*) FROM buyer_questionnaires WHERE user_id = $1 AND is_active = true`,
			[userId]
		);

		const activeFormCount = parseInt(activeFormsRes.rows[0].count, 10);

		if (activeFormCount >= maxAllowedForms) {
			return res.status(403).json({
				message: `You currently have ${activeFormCount} active questionnaires. You must wait for them to expire or delete them before submitting another.`,
			});
		}

		// Map text answers to expiration days:
		const timelineDaysMap = {
			"1_month": 30,
			"3_month": 90,
			"6_month": 180,
			"12_month": 365,
			undecided: 60,
			asap: 21,
		};

		// Set expiration based on timeline (fallback: 30 days)

		const daysToExpire = timelineDaysMap[purchase_timeline] || 30;
		const now = new Date();

		const expiresAt = new Date(
			now.getTime() + daysToExpire * 24 * 60 * 60 * 1000
		);

		console.log("🌱 expiresAt:", expiresAt);

		// ✅ Step 1: Insert the active form into buyer_questionnaires
		await pool.query(
			`INSERT INTO buyer_questionnaires (
			  user_id, budget, location,
			  owns_property, property_main_type, property_sub_type,
			  is_international, country, city, mortgage_status,
			  purchase_timeline, goals, importance_rank, experience_rating,
			  feedback, is_completed, last_updated, expires_at, is_active
			)
			VALUES (
			  $1, $2, $3, $4, $5,
			  $6, $7, $8, $9, $10,
			  $11, $12, $13, $14, $15,
			  $16, $17, $18, $19
			)
			ON CONFLICT (user_id) DO UPDATE SET
			  budget = EXCLUDED.budget,
			  location = EXCLUDED.location,
			  owns_property = EXCLUDED.owns_property,
			  property_main_type = EXCLUDED.property_main_type,
			  property_sub_type = EXCLUDED.property_sub_type,
			  is_international = EXCLUDED.is_international,
			  country = EXCLUDED.country,
			  city = EXCLUDED.city,
			  mortgage_status = EXCLUDED.mortgage_status,
			  purchase_timeline = EXCLUDED.purchase_timeline,
			  goals = EXCLUDED.goals,
			  importance_rank = EXCLUDED.importance_rank,
			  experience_rating = EXCLUDED.experience_rating,
			  feedback = EXCLUDED.feedback,
			  is_completed = true,
			  last_updated = CURRENT_TIMESTAMP,
			  expires_at = EXCLUDED.expires_at,
			  is_active = true
			`,
			[
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
				true,
				new Date(),
				expiresAt,
				true,
			]
		);

		// Step 2: Get latest version for this user
		const versionRes = await pool.query(
			`SELECT MAX(version_number) AS max_version FROM questionnaire_submissions WHERE user_id = $1`,
			[userId]
		);
		const nextVersion = (versionRes.rows[0].max_version || 0) + 1;

		// Step 3: Insert into versioned table
		await pool.query(
			`INSERT INTO questionnaire_submissions (
			user_id, version_number, budget, location,
			owns_property, property_main_type, property_sub_type,
			is_international, country, city, mortgage_status,
			purchase_timeline, goals, importance_rank, experience_rating,
			feedback
		) VALUES (
			$1,$2,$3,$4,$5,
			$6,$7,$8,
			$9,$10,$11,$12,
			$13,$14,$15,$16,
			$17
		)`,
			[
				userId,
				nextVersion,
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
			]
		);

		res.status(201).json({ message: "Questionnaire submitted and saved." });
		console.log("👤 Submitting version:", nextVersion);
		console.log("📝 Questionnaire POST hit by user", userId);
		console.log("📥 User ID:", userId);
		console.log("📄 Submission Data:", req.body);
	} catch (error) {
		console.error("❌ Questionnaire submission failed:", error);
		res.status(500).json({ message: "Server error", error: error.message });
		console.error("❌ Submission failed:", error.message, error.stack);
	}

	// 1) fetch all verified agents
	const { rows: agents } = await pool.query(`
	    SELECT
	      a.id,
	      a.specialties,
	      a.languages_spoken,
	      a.experience_years,
	      a.budget,
	      a.investment_expertise,
	      a.latitude,
	      a.longitude,
	      a.max_service_radius
	    FROM agents a
	    WHERE a.license_verified = true
	      AND a.firm_verified   = true
	  `);

	// 2) build a simple buyer object from what you just inserted
	const buyer = {
		property_type: property_main_type,
		budget: Number(budget),
		investment_goal, // if you capture this
		preferred_language, // from req.body
		latitude: Number(latitude),
		longitude: Number(longitude),
	};

	// 3) score each agent
	const scored = agents
		.map((agent) => ({
			agent,
			score: scoreAgent(buyer, agent),
		}))
		.filter((x) => x.score > 0) // drop zero‐matches
		.sort((a, b) => b.score - a.score) // highest first
		.slice(0, 5); // top 5

	// 4) persist each as an enquiry
	for (const { agent, score } of scored) {
		await pool.query(
			`INSERT INTO enquiries
	         (buyer_id, agent_id, questionnaire_id, score, status, created_at)
	       VALUES ($1,$2,$3,$4,'pending',NOW())`,
			[req.user.id, agent.id, questionnaireId, score]
		);
		// TODO: trigger notification/email to agent.user_id
	}

	// attach the matches to your response
	const matchedAgents = scored.map(({ agent, score }) => ({
		id: agent.id,
		score: score.toFixed(1),
	}));

	// finally send back to buyer, with both your original message AND the matches
	return res.status(201).json({
		message: "Questionnaire submitted and saved.",
		matches: matchedAgents,
	});
});

export const saveQuestionnaireDraft = asyncHandler(async (req, res) => {
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
		is_complete, // <- new flag!
	} = req.body;

	const userId = req.user.id;

	// If a draft already exists, update it. Otherwise insert.
	const existing = await pool.query(
		"SELECT id FROM buyer_questionnaires WHERE user_id = $1",
		[userId]
	);

	if (existing.rows.length) {
		await pool.query(
			`UPDATE buyer_questionnaires
			SET budget= $1, location = $2,
			owns_property = $3, property_main_type = $4, property_sub_type = $5,
			is_international = $6, country = $7, city = $8,
			mortgage_status = $9, purchase_timeline = $10,
			goals = $11, importance_rank = $12, experience_rating = $13,
			feedback = $14, is_complete = $15
			WHERE user_id = $16`,
			[
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
				is_complete,
				userId,
			]
		);
	} else {
		await pool.query(
			`INSERT INTO buyer_questionnaires
			(user_id, budget, location, owns_property,
				property_main_type, property_sub_type, is_international,
				country, city, mortgage_status, purchase_timeline,
				goals, importance_rank, experience_rating, feedback, is_complete)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
			[
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
				is_complete,
			]
		);
	}

	res.status(200).json({ message: "Draft save successfully." });
});

export const checkIfQuestionnaireComplete = asyncHandler(async (req, res) => {
	const userId = req.user.id;

	const result = await pool.query(
		"SELECT is_complete FROM buyer_questionnaires WHERE user_id = $1",
		[userId]
	);

	if (result.rows.length === 0) {
		return res.json({ is_complete: false });
	}

	res.json({ is_complete: result.rows[0].is_complete });
});

export const getQuestionnaireDraft = asyncHandler(async (req, res) => {
	const userId = req.user.id;

	const { rows } = await pool.query(
		`SELECT * FROM buyer_qeustionnaires WHERE user_id = $1 LIMIT 1`,
		[userId]
	);

	if (rows.length === 0) {
		return res.status(204).json({ message: "No Draft Found." });
	}

	res.status(200).json(rows[0]);
});

// Logic for 'Reminder Function' - Check for stale or incomlete forms
export const checkQuestionnaireReminder = asyncHandler(async (req, res) => {
	const userId = req.user.id;

	const query = `
	SELECT is_complete, last_updated
	FROM buyer_questionnaires
	WHERE user_id = $1
	`;

	const { rows } = await pool.query(query, [userId]);

	if (!rows.length) {
		await pool.query(
			`
			INSERT INTO notifications (user_id, type, message, link)
			VALUES ($1, 'reminder', 'You have not started your buyer form.', '/questionnaire')
		`,
			[userId]
		);
		// No form at all - suggest starting one.
		return res.json({
			needsReminder: true,
			reminder: {
				type: "questionnaire",
				message: "You haven’t started your buyer form.",
				link: "/questionnaire",
			},
		});
	}

	const { is_completed, last_updated } = rows[0];

	if (!is_completed) {
		await pool.query(
			`
			INSERT INTO notifications (user_id, type, message, link)
			VALUES ($1, 'reminder', 'Please complete your questionnaire.', '/questionnaire')
		`,
			[userId]
		);
		// Form not submitted = needs reminder.
		return res.json({
			needsReminder: true,
			reminder: {
				type: "questionnaire",
				message: "Your buyer form is incomplete.",
				link: "/questionnaire",
			},
		});
	}

	const lastUpdatedDate = new Date(last_updated);

	const now = new Date();

	const daysElapsed =
		(now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24);

	if (daysElapsed > 30) {
		// It's been over a month - time to prompt update.
		return res.json({
			needsReminder: true,
			reminder: {
				type: "questionnaire",
				message: "Your buyer form is over 30 days old. Consider updating it.",
				link: "/questionnaire",
			},
		});
	}

	// All good.
	return res.json({ needsReminder: false });
});
