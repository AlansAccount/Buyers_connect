import express from "express";
import {
	registerUser,
	loginUser,
	forgotPassword,
	resetPassword,
} from "../controllers/authController.js";
import { loginLimiter } from "../middlewares/limitMiddleware.js";

const router = express.Router();
// Apply login limit
router.post("/login", loginLimiter, loginUser);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
