// ===== agentController.js =====
import pool from "../config/db.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerAgent = asyncHandler(async (req, res) => {
	const {
		name, // full name from the form
		email,
		password,
		license_number,
		experience_years,
		bio,
		firm_name,
		registration_number,
		country,
		city,
		street_address,
		post_code,
		specialty,
		qualifications,
		languages_spoken,
	} = req.body;

	// Validate required fields.
	if (!name || !email || !password || !license_number || !registration_number) {
		return res.status(400).json({ message: "Missing required fields." });
	}

	// Check if a user with the provided email already exists.
	const existingUser = await pool.query(
		"SELECT * FROM users WHERE email = $1",
		[email]
	);
	if (existingUser.rows.length > 0) {
		return res.status(400).json({ message: "User already exists." });
	}

	// Create new user with role "agent"
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	const newUserResult = await pool.query(
		"INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'agent') RETURNING id, name, email, role",
		[name, email, hashedPassword]
	);
	const newUser = newUserResult.rows[0];

	// Process agent-specific fields.
	// If values came as JSON strings, parse them; otherwise, assume defaults.
	parsedSpecialties = JSON.parse(req.body.specialties || "[]"); // ✅ this is correct

	const parsedQualifications = qualifications ? JSON.parse(qualifications) : [];
	const parsedLanguages = languages_spoken ? JSON.parse(languages_spoken) : [];

	// Process file uploads – assuming any middleware set up gives req.files.
	const licenseFilePaths = req.files ? req.files.map((file) => file.path) : [];

	// Check if an agent profile already exists for this user.
	const existingAgent = await pool.query(
		"SELECT * FROM agents WHERE user_id = $1",
		[newUser.id]
	);
	if (existingAgent.rows.length > 0) {
		return res.status(400).json({ message: "Agent profile already exists." });
	}

	// Look up or create the firm.
	let firmId;
	const firmLookup = await pool.query(
		"SELECT id FROM firms WHERE registration_number = $1",
		[registration_number]
	);
	if (firmLookup.rows.length === 0) {
		const newFirm = await pool.query(
			`INSERT INTO firms (name, registration_number, country, city, street_address, post_code)
		 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
			[firm_name, registration_number, country, city, street_address, post_code]
		);
		firmId = newFirm.rows[0].id;
	} else {
		firmId = firmLookup.rows[0].id;
	}

	// Insert the agent record.
	await pool.query(
		`INSERT INTO agents (
		user_id, license_number, experience_years, specialties, qualifications, bio,
		languages_spoken, firm_id, license_files, license_verified, firm_verified
	  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, false)`,
		[
			newUser.id,
			license_number,
			experience_years,
			JSON.stringify(parsedSpecialties),
			JSON.stringify(parsedQualifications),
			bio,
			JSON.stringify(parsedLanguages),
			firmId,
			JSON.stringify(licenseFilePaths),
		]
	);

	// Do NOT generate a token or auto-login since you want the registration to await admin verification.
	res.status(201).json({
		message:
			"Agent registration submitted successfully. Await admin verification.",
	});
});
