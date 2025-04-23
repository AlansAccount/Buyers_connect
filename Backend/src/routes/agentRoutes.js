import express from "express";
import multer from "multer";
import { protect } from "../middlewares/authMiddleware.js";
import { registerAgent } from "../controllers/agentController.js";
import { getAgentDetails } from "../controllers/authController.js";

const router = express.Router();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/licenses/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({ storage });

router.post(
	"/register",

	upload.array("license_files", 5),
	registerAgent
);

// Get an agent's profile + properties
router.get("/:id", getAgentDetails);

export default router;
