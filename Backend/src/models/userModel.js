import pool from "../config/db.js";

//Create Users Table (if not exists)
const createUserTable = async () => {
	await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(225) NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(50) CHECK (role IN('buyer', 'agent')) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
    `);
};

createUserTable(); //Ensures table exists on startup.

//Function ot insert a new user

export const insertUser = async (name, email, hashedPassword, role) => {
	const result = await pool.query(
		"INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
		[name, email, hashedPassword, role]
	);
	return result.rows[0];
};

// Function to find user by email
export const findUserByEmail = async (email) => {
	const result = await pool.query("SELECT * FROM users WHERE email=$1", [
		email,
	]);
	return result.rows[0];
};
