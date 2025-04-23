import asyncHandler from "express-async-handler";
import pool from "../config/db.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Public

export const getUsers = async (req, res) => {
	try {
		const users = await pool.query("SELECT * FROM users");
		res.json(users.rows);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const getFeaturedAgents = asyncHandler(async (req, res) => {
	const query = `
	SELECT a.id AS agent_id, u.id AS user_id, u.name, u.email, u.profile_image
	FROM agents a
	JOIN users u ON a.user_id = u.id
	WHERE a.is_featured = true
	LIMIT 12; -- show a rotating set
	`;

	try {
		const { rows } = await pool.query(query);
		res.status(200).json(rows);
	} catch (error) {
		console.error("Failed to fetch featured agents:", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
});
