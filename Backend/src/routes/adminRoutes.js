import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
	getPendingAgents,
	verifyAgent,
	rejectAgent,
	agentStats,
	getAllBuyers,
	getAllVerifiedAgents,
	getAllFirms,
	getFirmByIdWithAgents,
} from "../controllers/adminController.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin ONLY routes should be protected.
router.get("/agents/pending", protect, adminOnly, getPendingAgents);

router.get("/stats", protect, adminOnly, agentStats);

router.get("/buyers", protect, adminOnly, getAllBuyers);

router.get("/agents", protect, adminOnly, getAllVerifiedAgents);

router.get("/firms", protect, adminOnly, getAllFirms);

router.get("/firms/:id", protect, adminOnly, getFirmByIdWithAgents);

router.put("/agents/:id/verify", protect, adminOnly, verifyAgent);

router.put("/agents/:id/reject", protect, adminOnly, rejectAgent);

export default router;
