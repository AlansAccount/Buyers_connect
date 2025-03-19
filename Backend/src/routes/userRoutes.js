import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
	updateUserProfile,
	deleteUser,
	getUserProfile,
} from "../controllers/authController.js";

const router = express.Router();

// ✅ Debugging logs to confirm route registration
router.get("/profile", protect, getUserProfile); // ✅ This was missing!
router.put("/profile", protect, updateUserProfile);
router.delete("/profile", protect, deleteUser);
// Public route (No authentication required)
router.get("/", (req, res) => {　
	res.json({ message: "User routes are working!" });
});

export default router;
