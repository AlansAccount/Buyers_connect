import express from "express";
import { registerFirm } from "../controllers/firmController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/firm-docs/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({ storage });

const router = express.Router();

// POST /api/firms/register
router.post(
	"/firm-registration",
	protect,
	upload.array("firm_docs", 5),
	registerFirm
);

export default router;
