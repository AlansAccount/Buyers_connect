import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import pool from "../config/db.js";

// Middleware to protect routes
export const protect = asyncHandler(async (req, res, next) => {
	console.log("Incoming Auth Header: ", req.header.authorization);
	let token;

	// Check if authorization header exists and starts with 'Bearer '
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer ")
	) {
		try {
			// Extract token from header
			token = req.headers.authorization.split(" ")[1];

			// Verify the token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Fetch full user detail from database (role, firm_id)
			const userQuery =
				"SELECT id, email, role, firm_id FROM users WHERE id = $1;";
			const { rows } = await pool.query(userQuery, [decoded.id]);

			if (!rows.length) {
				res.status(401);
				throw new Error("User not found.");
			}

			// Attach full user details to req.user
			req.user = rows[0];

			console.log("✅ User authenticated:", req.user); // Debug log

			next(); // Continue to protected route
		} catch (error) {
			res.status(401);
			throw new Error("Not authorized, invalid token");
		}
	} else {
		res.status(401).json({ message: "Not authorized, no token provided" });
	}
	console.log("Incoming Auth Header: ", req.headers.authorization);
});

// Middleware to Restrict Access to Agents Only.

export const agentOnly = asyncHandler(async (req, res, next) => {
	if (req.user && req.user.role === "agent") {
		next();
	} else {
		console.log("❌ Access Denied - User Role:", req.user?.role); // Log role if incorrect
		res.status(403);
		throw new Error("Access denied. Agents only.");
	}
});

// ✅ INSERT HERE:
export const verifiedAgentOnly = asyncHandler(async (req, res, next) => {
	const { id } = req.user;

	const agentQuery = await pool.query(
		"SELECT * FROM agents WHERE user_id = $1",
		[id]
	);

	if (!agentQuery.rows.length) {
		return res.status(403).json({ message: "Agent profile not found." });
	}

	const agent = agentQuery.rows[0];

	if (!agent.license_verified) {
		return res.status(403).json({
			message:
				"You must be verified before accessing this feature. Await admin approval.",
		});
	}

	req.agent = agent; // Attach agent data to request
	next();
});
// Middleware to Allow Agents to Edit Only Their Own Properties or Firm Properties.

export const canModifyProperty = asyncHandler(async (req, res) => {
	const { id: userId, role, firm_id } = req.user;
	const propertyId = req.params.id;

	//Fetch the property's owner and firm from DB
	const propertyQuery = `
    SELECT p.agent_id, u.firm_id
    FROM properties p
    JOIN users u ON p.agent_id = u.id
    WHERE p.id = $1
    `;
	const { rows } = await pool.query(propertyQuery, [propertyId]);

	if (!rows.length) {
		res.status(404);
		throw new Error("Property not found");
	}

	const property = rows[0];

	// Check if user is the owner or belongs to the same firm.

	if (
		property.agent_id === userId ||
		(firm_id && firm_id === property.firm_id)
	) {
		next(); // Allow modification
	} else {
		res.status(403);
		throw new Error(
			"Access Denied. You can only modify your own listings or your firm's listings."
		);
	}
});

export const adminOnly = asyncHandler(async (req, res, next) => {
	if (req.user && req.user.role === "admin") next();
	else throw new Error("Access denied. Admin only.");
});
