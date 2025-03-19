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
