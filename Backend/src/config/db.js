import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";

dotenv.config();

// Create a new PostgreSQL connection pool
const pool = new Pool({
	user: process.env.DB_USER || "postgres",
	host: process.env.DB_HOST || "localhost",
	database: process.env.DB_NAME || "buyers_connect",
	password: process.env.DB_PASSWORD || "your_password_here",
	port: process.env.DB_PORT || 5432,
});

pool.on("connect", () => {
	console.log("✅ PostgreSQL Database Connected Successfully!");
});

// Function to store logs in PostgreSQL.
export const logToDatabase = async (level, message) => {
	try {
		await pool.query(
			"INSERT INTO api_logs (level, message, created_at) VALUES ($1, $2, NOW())",
			[level, message]
		);
	} catch (error) {
		console.error("Failed to log to database:", error.message);
	}
};

export default pool;
