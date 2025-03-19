import asyncHandler from "express-async-handler";
import pool from "../config/db.js"; // Ensures this file correctly connects to PostgreSQL
import { sendEmail } from "../config/email.js";

// Create a new property (Agents Only).
export const createProperty = asyncHandler(async (req, res) => {
	const { title, description, price, location, property_type } = req.body;
	const user_id = req.user.id;

	if (!title || !price || !location || !property_type) {
		res.status(400);
		throw new Error("Please fill in all required fields.");
	}

	//Fetch agent_id from agents table
	const agentQuery = "SELECT id FROM agents WHERE user_id = $1;";
	const agentResult = await pool.query(agentQuery, [user_id]);

	if (!agentResult.rows.length) {
		res.status(403);
		throw new Error("You are not registered as an agent.");
	}

	const agent_id = agentResult.rows[0].id; // Get the correct agent_id.

	// Insert property into DB
	const query = `
        INSERT INTO properties (agent_id, title, description, price, location, property_type)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
	const values = [agent_id, title, description, price, location, property_type];

	const { rows } = await pool.query(query, values);
	res.status(201).json(rows[0]); // Return the created property
});

// Get All Properties (Public).
export const getAllProperties = asyncHandler(async (req, res) => {
	let { location, property_type, min_price, max_price, search, sort } =
		req.query;
	let query = "SELECT * FROM properties";
	let values = [];
	let index = 1;

	// Check if any filters exist.
	let conditions = []; // Store conditions separately

	// Filter by location
	if (location) {
		conditions.push(`location ILIKE $${index}`);
		values.push(`%${location}%`);
		index++;
	}

	// Filter by property type.
	if (property_type) {
		conditions.push(`property_type = $${index}`);
		values.push(property_type);
		index++;
	}

	// Convert min_price and max_price to numbers from strings.
	min_price = min_price ? Number(min_price) : null;
	max_price = max_price ? Number(max_price) : null;

	// Filter by price range
	if (min_price) {
		conditions.push(`price >= $${index}`);
		values.push(min_price);
		index++;
	}
	if (max_price) {
		conditions.push(`price <= $${index}`);
		values.push(max_price);
		index++;
	}

	// Search by title or description.
	if (search) {
		conditions.push(
			`(title ILIKE $${index} OR description ILIKE $${index + 1})`
		);
		values.push(`%${search}%`, `%{search}%`);
		index += 2;
	}

	// Only add WHERE clause if there are conditions.
	if (conditions.length > 0) {
		query += " WHERE " + conditions.join(" AND ");
	}

	// Sorting options
	if (sort === "price_asc") {
		query += " ORDER BY price ASC";
	} else if (sort === "price_desc") {
		query += " ORDER BY price DESC";
	} else {
		query += " ORDER BY created_at DESC"; // Default: Newest First.
	}

	// 🔥 Debugging: Log the exact query before executing it
	console.log("🛠️ Generated SQL Query:", query);
	console.log("🛠️ Query Values:", values);

	try {
		const { rows } = await pool.query(query, values);
		res.status(200).json(rows);
	} catch (error) {
		console.error("❌ SQL Execution Error:", error.message);
		res
			.status(500)
			.json({ message: "Database query error", error: error.message });
	}

	// // Execute Query.
	// const { rows } = await pool.query(query);
	// res.status(200).json(rows);
});

// Get a Single Property by ID (Public).
export const getPropertyById = asyncHandler(async (req, res) => {
	const propertyId = req.params.id;
	const query = "SELECT * FROM properties WHERE id = $1;";
	const { rows } = await pool.query(query, [propertyId]);

	if (!rows.length) {
		res.status(404);
		throw new Error("Property Not Found.");
	}
	res.status(200).json(rows[0]); // Returns the searched property by the ID.
});

// Update Property (AGents Only & OQnership Restricted Applied).
export const updateProperty = asyncHandler(async (req, res) => {
	const { title, description, price, location, property_type } = req.body;
	const propertyId = req.params.id;
	const agent_id = req.user.id;

	// Check if property exists
	const checkQuery = "SELECT * FROM properties WHERE id = $1;";
	const checkResult = await pool.query(checkQuery, [propertyId]);

	if (!checkResult.rows.length) {
		res.status(404);
		throw new Error("Property Not Found.");
	}

	// Only the owner or agents from the same frim can update.
	const updateQuery = `
    UPDATE properties
    SET title = $1, description = $2, price = $3, location = $4, property_type = $5
    WHERE id = $6 AND agent_id = $7 RETURNING *;`;

	const values = [
		title,
		description,
		price,
		location,
		property_type,
		propertyId,
		agent_id,
	];

	const { rows } = await pool.query(updateQuery, values);
	if (!rows.length) {
		res.status(403);
		throw new Error("Access denies. You can only update your own listings.");
	}

	res.status(200).json(rows[0]); // Returning the updated property listing.
});

// Delete Proeprty (Agents Only & Ownership Restriction Applied).
export const deleteProperty = asyncHandler(async (req, res) => {
	const propertyId = req.params.id;
	const agent_id = req.user.id; // Authenticated Agent.

	//Check if property exists
	const checkQuery = "SELECT *FROM properties WHERE id =$1;";
	const checkResult = await pool.query(checkQuery, [propertyId]);

	if (!checkResult.rows.length) {
		res.status(404);
		throw new Error("Property Not Found.");
	}

	//Only the owner can delete
	const deleteQuery =
		"DELETE FROM properties WHERE id = $1 AND agent_id = $2 RETURNING *;";
	const { rows } = await pool.query(deleteQuery, [propertyId, agent_id]);

	if (!rows.length) {
		res.status(403);
		throw new Error("Access denied. You can only delete your own listings.");
	}

	res.status(200).json({ message: "Property deleted successfully" });
});

// Favourite a Property
export const favouriteProperty = asyncHandler(async (req, res) => {
	const user_id = req.user.id;
	const property_id = req.params.id;

	// Check if property exists before inserting.
	const propertyCheckQuery = "SELECT id FROM properties WHERE id = $1;";
	const propertyResult = await pool.query(propertyCheckQuery, [property_id]);

	if (!propertyResult.rows.length) {
		res.status(404);
		throw new Error("Property not found.");
	}

	// Inser into favourites table.
	const query = `
	INSERT INTO favourites (user_id, property_id)
	VALUES ($1, $2)
	ON CONFLICT (user_id, property_id) DO NOTHING
	RETURNING *;
	`;

	const { rows } = await pool.query(query, [user_id, property_id]);

	if (!rows.length) {
		res.status(400);
		throw new Error("Property already favourited.");
	}

	res.status(201).json({ message: "Property added to favourites." });
});

// Get Favourite Properties.
export const getFavourites = asyncHandler(async (req, res) => {
	const user_id = parseInt(req.user.id, 10); // <- Convert user_id into an integer

	console.log("🛠️ Debug: Received user_id ->", user_id); // ✅ Log user_id

	const query = `
	SELECT p.*
	FROM favourites f
	JOIN properties p ON f.property_id = p.id
	WHERE f.user_id = $1;
`;

	const { rows } = await pool.query(query, [user_id]);

	res.status(200).json(rows);
});

// Remove a Favourited Property.
export const removeFavourite = asyncHandler(async (req, res) => {
	const user_id = req.user.id;
	const property_id = req.params.id;

	const query = `
	DELETE FROM favourites
	WHERE user_id = $1 AND property_id = $2
	RETURNING *;
	`;

	const { rows } = await pool.query(query, [user_id, property_id]);

	if (!rows.length) {
		res.status(404);
		throw new Error("Favourite not found.");
	}

	res.status(200).json({ message: "Property removed from favourites." });
});

// Buyers Send an Enquiry
export const sendEnquiry = asyncHandler(async (req, res) => {
	const buyer_id = req.user.id;
	const property_id = req.params.id;
	const { message } = req.body;

	if (!message) {
		res.status(400);
		throw new Error("Message is required.");
	}

	// Check if property exists
	const propertyQuery = "SELECT agent_id FROM properties WHERE id = $1;";
	const propertyResult = await pool.query(propertyQuery, [property_id]);

	if (!propertyResult.rows.length) {
		res.status(404);
		throw new Error("Property not found.");
	}

	const agent_id = propertyResult.rows[0].agent_id;

	// Insert enquiry into database
	const query = `
	INSERT INTO enquiries (buyer_id, property_id, agent_id, message)
	VALUES ($1, $2, $3, $4)
	RETURNING *;
	`;

	const values = [buyer_id, property_id, agent_id, message];

	const { rows } = await pool.query(query, values);

	// Send email to the agent
	const agentQuery =
		"SELECT email FROM users WHERE id = (SELECT user_id FROM agents WHERE id = $1);";
	const agentResult = await pool.query(agentQuery, [agent_id]);

	if (agentResult.rows.length) {
		const agentEmail = agentResult.rows[0].email;
		await sendEmail(
			agentEmail,
			"New Property Enquiry",
			`You have a new enquiry: ${message}`
		);
	}

	res.status(201).json(rows[0]);
});

// Get Buyer's Enquiries
export const getBuyerEnquiry = asyncHandler(async (req, res) => {
	const buyer_id = req.user.id;

	const query = `
	SELECT e.*, p.title AS property_title, p.location, a.user_id AS agent_user_id 
	FROM enquiries e
	JOIN properties p ON e.property_id = p.id
	JOIN agents a ON e.agent_id = a.id
	WHERE e.buyer_id = $1
	`;

	const { rows } = await pool.query(query, [buyer_id]);

	res.status(200).json(rows);
});

// Get Agent's Enquiries
export const getAgentEnquiry = asyncHandler(async (req, res) => {
	const agent_id = req.user.id;

	const query = `
	SELECT e.*, p.title AS property_title, p.location, u.name AS buyer_name, u.email AS buyer_email
	FROM enquiries e
	JOIN properties p ON e.property_id = p.id
	JOIN users u ON e.buyer_id = u.id
	WHERE e.agent_id = (SELECT id FROM agents WHERE user_id = $1);
	`;

	const { rows } = await pool.query(query, [agent_id]);

	res.status(200).json(rows);
});

// Agents Reply to an Enquiry
export const replyToEnquiry = asyncHandler(async (req, res) => {
	const agent_id = req.user.id;
	const enquiry_id = req.params.enuiryId;
	const { response } = req.body;

	if (!response) {
		res.status(400);
		throw new Error("Response message is requried.");
	}

	// Check if the enquiry exists
	const checkQuery =
		"Select * FROM enquiries WHERE id = $1 AND agent_id = (SELECT id FROM agents WHERE user_id = $2);";
	const checkResult = await pool.query(checkQuery, [enquiry_id, agent_id]);

	if (!checkResult.rows.length) {
		res.status(404);
		throw new Error("Enquiry not found or unauthorised.");
	}

	// Update the enquiry with the agent's response.
	const updateQuery =
		"UPDATE enquiries SET response = $1 WHERE id = $2 RETURNING *;";
	const { rows } = await pool.query(updateQuery, [response, enquiry_id]);

	// Send email to the buyer.
	const buyerQuery = "SELECT email FROM users WHERE id = $1;";
	const buyerResult = await pool.query(buyerQuery, [rows[0].buyer_id]);

	if (!buyerResult.rows.length) {
		const buyerEmail = buyerResult.rows[0].email;
		await sendEmail(
			buyerEmail,
			"Response to You Enquiry",
			`The agent has repied: ${response}`
		);
	}

	res.status(200).json(rows[0]);
});
