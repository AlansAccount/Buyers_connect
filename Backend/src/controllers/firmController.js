import pool from "../config/db.js";
import asyncHandler from "express-async-handler";

export const registerFirm = asyncHandler(async (req, res) => {
	const {
		name,
		registration_number,
		country,
		city,
		street_address,
		post_code,
	} = req.body;

	// Check if firm already exists by registration number.
	const exists = await pool.query(
		"SELECT id FROM firms WHERE registration_number = $1",
		[registration_number]
	);

	if (exists.rows.length > 0) {
		return res.status(400).json({ message: "Firm already registered." });
	}

	// Grab file paths from multer

	const filePaths = req.files.map((file) => file.path);

	const result = await pool.query(
		`INSERT INTO firms 
        (name, registration_number, country, city, street_address, post_code, firm_docs)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
		[
			name,
			registration_number,
			country,
			city,
			street_address,
			post_code,
			filePaths,
		]
	);

	res.status(201).json({
		message: "✅ Firm registration complete.",
		firm: result.rows[0],
	});
});
