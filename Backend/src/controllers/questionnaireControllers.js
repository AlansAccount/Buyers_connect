import pool from "../config/db.js";
import asyncHandler from "express-async-handler";
import { maxBuyerSubmissions } from "../config/matchConfig.js";
import scoreAgent from "../services/matchmakingService.js";

export const submitQuestionnaire = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // After saving questionnaire, find matches
  const matches = await findMatches(questionnaireId);
  
  // Return both questionnaire submission confirmation and matches
  res.status(201).json({
    message: "Questionnaire submitted successfully",
    matches: matches.map(m => ({
      agentId: m.agentId,
      score: Math.round(m.score)
    }))
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
				message: "You haven't started your buyer form.",
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