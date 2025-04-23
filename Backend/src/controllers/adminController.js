import pool from "../config/db.js";
import asyncHandler from "express-async-handler";

// 1. List all agents awaiting verification
export const getPendingAgents = asyncHandler(async (req, res) => {
	const result = await pool.query(`
		SELECT 
			a.id AS agent_id,
			a.license_number,
			a.license_files,
			a.bio,
			a.created_at,
			u.name AS agent_name,
			u.email AS agent_email
		FROM agents a
		JOIN users u ON a.user_id = u.id
		WHERE a.license_verified = false;

	`);
	res.status(200).json(result.rows); // array of pending agents.
});

// 2. Verify an agent (admin approves).
export const verifyAgent = asyncHandler(async (req, res) => {
	const agentId = req.params.id;
	console.log("🔍 Verifying agent ID:", agentId);

	try {
		await pool.query(
			`
			UPDATE agents
			SET license_verified = true
			WHERE id = $1
			`,
			[agentId]
		);

		res.status(200).json({ message: "Agent verified successfully." });
	} catch (err) {
		console.error("❌ Verification DB error:", err.message);
		res.status(500).json({ message: "Internal error verifying agent." });
	}
});

// 3. Reject an agent (optionally delete, or set a flag)
export const rejectAgent = asyncHandler(async (req, res) => {
	const agentId = req.params.id;

	// !!! If you want to delete: (can be changed to soft delete)
	await pool.query(`DELETE FROM agents WHERE id = $1`, [agentId]);

	res.status(200).json({ message: "Agent reject and deleted." });
});

export const agentStats = asyncHandler(async (req, res) => {
	const result = await pool.query(
		` 
		SELECT 
  			(SELECT COUNT(*) FROM users WHERE role = 'agent') AS total_agents,
  			(SELECT COUNT(*) FROM users WHERE role = 'buyer') AS total_buyers,
  			(SELECT COUNT(*) FROM firms) AS total_firms,
  			(SELECT COUNT(*) FROM properties) AS total_listings;
			`
	);

	res.status(200).json(result.rows[0]);
});

export const getAllBuyers = asyncHandler(async (req, res) => {
	const result = await pool.query(`
		SELECT id, name, email, created_at
		FROM users
		WHERE role = 'buyer'
		ORDER BY created_at DESC;
	`);
	res.status(200).json(result.rows);
});

export const getUsersByRole = asyncHandler(async (req, res) => {
	const { role } = req.query;

	if (!role) {
		return res.status(400).json({ message: "Missing role parameter." });
	}

	const result = await pool.query(
		"SELECT id, name, email, created_at FROM users WHERE role = $1 ORDER BY created_at DESC",
		[role]
	);

	res.status(200).json(result.rows);
});

export const getAllVerifiedAgents = asyncHandler(async (req, res) => {
	const result = await pool.query(`
		SELECT 
			a.id AS agent_id,
			u.name AS agent_name,
			u.email AS agent_email,
			a.license_number,
			a.specialties,
			a.created_at,
			f.name AS firm_name,
			f.city,
			f.country
		FROM agents a
		JOIN users u ON a.user_id = u.id
		LEFT JOIN firms f ON a.firm_id = f.id
		WHERE a.license_verified = true
		ORDER BY a.created_at DESC
	`);

	const agents = result.rows; // pg now gives us actual arrays for specialties

	res.status(200).json(agents);
});

export const getAllFirms = asyncHandler(async (req, res) => {
	const result = await pool.query(`
		SELECT 
			f.id,
			f.name,
			f.registration_number,
			f.country,
			f.city,
			f.street_address,
			f.post_code,
			f.created_at,
			COUNT(a.id) AS agent_count
		FROM firms f
		LEFT JOIN agents a ON a.firm_id = f.id
		GROUP BY f.id
		ORDER BY f.created_at DESC
	`);
	res.status(200).json(result.rows);
});

export const getFirmByIdWithAgents = asyncHandler(async (req, res) => {
	const firmId = req.params.id;

	const firmRes = await pool.query(`SELECT * FROM firms WHERE id = $1`, [
		firmId,
	]);

	if (firmRes.rows.length === 0) {
		return res.status(404).json({ message: "Firm not found." });
	}

	const firm = firmRes.rows[0];

	const agentsRes = await pool.query(
		`SELECT 
			a.id AS agent_id,
			u.name AS agent_name,
			u.email AS agent_email,
			a.specialties,
			a.license_number,
			a.created_at
		FROM agents a
		JOIN users u ON a.user_id = u.id
		WHERE a.firm_id = $1 AND a.license_verified = true
		ORDER BY a.created_at DESC`,
		[firmId]
	);

	// specialties is now text[] so no need for JSON.parse
	const agents = agentsRes.rows;

	res.status(200).json({ firm, agents });
});
