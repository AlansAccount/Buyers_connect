import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
	updateUserProfile,
	deleteUser,
	getUserProfile,
} from "../controllers/authController.js";

import { getUsers, getFeaturedAgents } from "../controllers/userController.js";

const router = express.Router();

// ✅ Debugging logs to confirm route registration
router.get("/profile", protect, getUserProfile); // ✅ This was missing!
router.put("/profile", protect, updateUserProfile);
router.delete("/profile", protect, deleteUser);
router.get("/", getUsers);
router.get("/featured", getFeaturedAgents);

export default router;
