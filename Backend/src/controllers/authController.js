import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { insertUser, findUserByEmail } from "../models/userModel.js";
import { sendEmail } from "../config/email.js";
import crypto from "crypto";
import pool from "../config/db.js";
import logger from "../utils/logger.js";
import { profile } from "console";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public

export const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, role } = req.body;

	//Check if user already exists
	const existingUser = await findUserByEmail(email);
	if (existingUser) {
		res.status(400);
		throw new Error("User already exists");
	}

	// Hash password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	// Insert New user
	const newUser = await insertUser(name, email, hashedPassword, role);

	// After inserting the new user.
	if (role === "agent") {
		await pool.query(
			`INSERT INTO agents (user_id, license_number, experience_years, specialty) 
			VALUES ($1, $2, $3, $4)`,
			[
				newUser.id,
				"DEFAULT-LICENSE", // THESE are placeholder values
				0,
				"General", // Can be updated by the agent later.
			]
		);
	}

	// Generate JWT token
	const token = jwt.sign(
		{ id: newUser.id, email: newUser.email, role: newUser.role },
		process.env.JWT_SECRET,
		{
			expiresIn: "30d",
		}
	);

	// Send Welcome Email
	try {
		await sendEmail(
			email,
			"Welcome to Buyers Agent Conenct",
			`Hi ${name}, /n//Thank you for registering on our platform. We're excited to have you!/n/nBest Regards, /nBuyers Agents Conenct Team`
		);
		console.log(` Welcome email sent to ${email}`);
	} catch (error) {
		console.error(`Failed to send welcome email:`, error.message);
	}

	res.status(201).json({
		id: newUser.id,
		name: newUser.name,
		email: newUser.email,
		role: newUser.role,
		token,
	});
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

export const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	// Find user by email
	const user = await findUserByEmail(email);
	if (!user) {
		// Log failed login attempts
		logger.warn(`Failed login attempt for non-existent user: ${email}`);
		res.status(401);
		throw new Error("Invalid email or password");
	}

	// Compare passwords

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		// Log failed login attemps.
		logger.warn(`Failed login attempt for: ${email}`);
		res.status(401);
		throw new Error("Invalid email or password");
	}

	// Generate JWT Token
	const token = jwt.sign(
		{ id: user.id, email: user.email, role: user.role },
		process.env.JWT_SECRET,
		{
			expiresIn: "30d",
		}
	);

	res.json({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		token,
	});
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (Requires JWT)

export const getUserProfile = asyncHandler(async (req, res) => {
	console.log("🔍 Decoded user from token:", req.user);

	const user = await findUserByEmail(req.user.email);
	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	res.json({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	});

	console.log("Looking up use for:", req.user.email);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;
	console.log(req.user);

	const user = await findUserByEmail(req.user.email);
	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	const updatedName = name || user.name;
	const updatedEmail = email || user.email;

	let updatedPassword = user.password;
	if (password) {
		const salt = await bcrypt.genSalt(10);
		updatedPassword = await bcrypt.hash(password, salt);
	}

	const result = await pool.query(
		"UPDATE users SET name=$1, email=$2, password=$3 WHERE id=$4 RETURNING *",
		[updatedName, updatedEmail, updatedPassword, user.id]
	);

	const updatedUser = result.rows[0];

	const token = jwt.sign(
		{ id: updatedUser.id, email: updatedUser.email }, // May need to add role: updateUser.role to the object later.
		process.env.JWT_SECRET,
		{
			expiresIn: "30d",
		}
	);

	res.json({
		id: updatedUser.id,
		name: updatedUser.name,
		email: updatedUser.email,
		role: updatedUser.role,
		token,
	});
});

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private (Requires JWT)
export const deleteUser = asyncHandler(async (req, res) => {
	console.log(req.user);

	const user = await findUserByEmail(req.user.email);
	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	await pool.query("DELETE FROM users WHERE id=$1", [user.id]);

	res.json({ message: "User deleted successfully" });
});

/**
 * @desc	Initiates password reset by sending a reset link to the user's email.
 * @route	POST /api/auth/forgot-password
 * @access	Public
 *   */

export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	// Check if user exists in database
	const userCheck = await pool.query(
		"SELECT email FROM users WHERE email = $1",
		[email]
	);
	if (userCheck.rows.length === 0) {
		return res.status(404).json({ message: "User not found" });
	}

	// Generate a secure reset token (32 random bytes, converted to hex)
	const resetToken = crypto.randomBytes(32).toString("hex");

	// Token expiry time (15 minutes for now).
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

	// Store token in the database
	await pool.query(
		"INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at, created_at = CURRENT_TIMESTAMP",
		[email, resetToken, expiresAt]
	);

	// Construct password reset URL (Modify as needed).
	const resetUrl = `http://localhost:5000/reset-password?token=${resetToken}`; //CHANGE THIS TO THE REAL FRONTEND URL

	// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

	// 	// Construct a real frontend URL
	// const resetUrl = `http://yourfrontend.com/reset-password?token=${resetToken}`;

	// Send email with reset link
	await sendEmail(
		email,
		"Password Reset Request",
		`You requested a password resetToken. Click the link below to reset your password:\n\n
		<a href="${resetUrl}" target="_blank">Reset Password</a>\n\n
		This link expires in 15 minutes.`
	);

	res.status(200).json({ message: "Password reset email sent" });
});

/**
 * @desc   Reset the user's password
 * @route  POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
	const { token, newPassword } = req.body;

	// 1. Find token in the database
	const tokenCheck = await pool.query(
		"SELECT email, expires_at FROM password_resets WHERE token = $1",
		[token]
	);

	if (tokenCheck.rows.length === 0) {
		return res.status(400).json({ message: "Invalid or expired token" });
	}

	const { email, expires_at } = tokenCheck.rows[0];

	// 2. Check if the token is expired
	if (new Date() > expires_at) {
		return res
			.status(400)
			.json({ message: "Token expired, request a new one" });
	}

	// 3. Hash the new password
	const hashedPassword = await bcrypt.hash(newPassword, 10);

	// 4. Update the user's password in the database
	await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
		hashedPassword,
		email,
	]);

	// 5. Delete the token after successful reset
	await pool.query("DELETE FROM password_resets WHERE token = $1", [token]);

	res.status(200).json({ message: "Password reset was Successful" });
});

// GET /api/agents/:id -> Get agent detials + their listings.
export const getAgentDetails = asyncHandler(async (req, res) => {
	const agentId = req.params.id;

	const query = `
	SELECT 
		u.id AS user_id,
		u.name,
		u.email,
		u.profile_image,
		a.id AS agent_id,
		p.id AS property_id,
		p.title,
		p.price,
		p.location,
		p.property_main_type,
		p.property_sub_type,
		p.image_url
	FROM agents a
	JOIN users u ON a.user_id = u.id
	LEFT JOIN properties p ON a.id = p.agent_id
	WHERE a.id = $1;
	`;

	const { rows } = await pool.query(query, [agentId]);

	if (!rows.length) {
		return res.status(404).json({ message: "Agent not found" });
	}

	const agentInfo = {
		agent_id: rows[0].agent_id,
		user_id: rows[0].user_id,
		name: rows[0].name,
		email: rows[0].email,
		profile_image: rows[0].profile_image,
		properties: rows
			.filter((row) => row.property_id)
			.map((p) => ({
				id: p.property_id,
				title: p.title,
				price: p.price,
				location: p.location,
				mainType: p.property_main_type,
				subType: p.property_sub_type,
			})), // Filter out properties that are null.
	};

	res.status(200).json(agentInfo);
});
