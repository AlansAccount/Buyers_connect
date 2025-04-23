import express from "express";
import { protect, agentOnly } from "../middlewares/authMiddleware.js"; // Only need `protect` from authMiddleware.js not the others.
import {
	createProperty,
	getAllProperties,
	getPropertyById,
	updateProperty,
	deleteProperty,
	favouriteProperty,
	getFavourites,
	removeFavourite,
	sendEnquiry,
	getBuyerEnquiry,
	getAgentEnquiry,
	replyToEnquiry,
} from "../controllers/propertyController.js";

import { verifiedAgentOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Get all properties
router.get("/", getAllProperties);

//Buyers: Get all favourite properties.
router.get("/favourites", protect, getFavourites);

// Public: Get a single property by ID
router.get("/:id", getPropertyById);

// Agents Only: Create a New Property.
// router.post("/", protect, agentOnly, createProperty);

router.post("/properties", protect, verifiedAgentOnly, createProperty);

//Agents Only: Update their own or firm's properties,
router.put("/:id", protect, updateProperty);

// Agents Only: Delete their own property
router.delete("/:id", protect, deleteProperty);

// Buyers: Add a property to favourites.
router.post("/:id/favourite", protect, favouriteProperty);

//Buyers: Remove a property from favourites.
router.delete("/:id/favourite", protect, removeFavourite);

// Buyers: Send an enquiry to an agent.
router.post("/:id/enquiry", protect, sendEnquiry);

// Buyers: View their sent eqnuiries.
router.get("/enquiries", protect, getBuyerEnquiry);

// Agents: View all enquiries for their properties
router.get("/agent/enquiries", protect, agentOnly, getAgentEnquiry);

// Agents: Reply to an enquiry.
router.post("/enquiry/:enquiryId/reply", protect, agentOnly, replyToEnquiry);

export default router;
