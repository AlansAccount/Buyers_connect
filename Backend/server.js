// ✅ 1. Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// ✅ 2. Import Required Packages
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { Server } from "socket.io";
import http from "http";

// ✅ 3. Import Routes & Configurations
import userRoutes from "./src/routes/userRoutes.js";
import agentRoutes from "./src/routes/agentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import propertyRoutes from "./src/routes/propertyRoutes.js";
import questionnaireRoutes from "./src/routes/questionnaireRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import firmRoutes from "./src/routes/firmRoutes.js";

console.log("questionnaireRoutes mounted at /api/questionnaire");

// import CRON
import "./src/cronJobs.js"; // 👈 boots up cron jobs automatically

import pool from "./src/config/db.js";
import { apiLimiter } from "./src/middlewares/limitMiddleware.js";
import logger from "./src/utils/logger.js";

import jwt from "jsonwebtoken";
// ✅ 4. Create an Express Application
const app = express();

// ✅ 5. Middleware Setup
app.use(
	cors({
		origin: "http://localhost:3000", // My frotnend origin.
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
	})
); // Enable CORS
app.use(express.json()); // Parse JSON requests
app.use(morgan("dev")); // Log HTTP requests
app.use(helmet()); // Add security headers
app.use(apiLimiter); // Apply rate limiting middleware

// ✅ 6. Logging Middleware (before routes)
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.url} - ${req.ip}`);
	next();
});

// ✅ 7. Register API Routes
app.use("/api/users", userRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/firms", firmRoutes);

// ✅ 8. Sample Root Endpoint
app.get("/", (req, res) => {
	res.send("Buyers Agent Connect API is running...");
});

// ✅ 9. Global Error Handler Middleware
app.use((err, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	res.status(statusCode).json({
		message: err.message,
		stack: process.env.NODE_ENV === "production" ? null : err.stack,
	});
});

console.log("🔍 Registered routes:");
app._router.stack.forEach((r) => {
	if (r.route && r.route.path) {
		console.log(`${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
	}
});

// ✅ 10. Create HTTP & WebSocket Server
const server = http.createServer(app);

// Attach WebSocket server properly.
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

// ✅ 12. Start HTTP & WebSocket Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`✅ Server & WebSocket running on port ${PORT}`);
});

// JWT Middleware for WebSocket Auth.
io.use((socket, next) => {
	const token = socket.handshake.auth?.token;

	if (!token) {
		console.log("No token Provided.");
		return next(new Error("Authentication error"));
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		socket.userId = decoded.id; // Attaches user ID to socket.
		next();
	} catch (err) {
		console.log("Invalid Token");
		return next(new Error("Authentication Error."));
	}
});

// ✅ 11. WebSocket Events
io.on("connection", (socket) => {
	console.log(`🟢 WebSocket Connected: ${socket.id}`);

	// Keep WebSocket Aline (Ping-Pong)
	const heartbeat = setInterval(() => {
		socket.emit("ping");
	}, 15000); // Sends a ping every 15 seconds.

	socket.on("pong", () => {
		console.log(`WebSocket ${socket.id} is still alive.`);
	});

	// When a user conencts, they must join their own room.
	socket.on("joinRoom", () => {
		socket.join(`user-${socket.userId}`);
		console.log(`User ${socket.userId} joined room user-${socket.userId}`);
	});

	socket.on("sendMessage", async ({ receiverId, content }) => {
		const senderId = socket.userId; // Secured!
		try {
			console.log(
				`Received Message: ${content} from ${senderId} to ${receiverId}`
			);

			// Store message in DB
			const result = await pool.query(
				"INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
				[senderId, receiverId, content]
			);

			const message = result.rows[0];

			// Emit message to receiver
			io.to(`user-${receiverId}`).emit(`message-${receiverId}`, message);

			// Also send to sender.
			io.to(`user-${senderId}`).emit(`message-${senderId}`, message);

			console.log(`📩 Message Sent by ${senderId}: ${message.content}`);
		} catch (error) {
			console.error("❌ Error Sending Message:", error.message);
		}
	});

	socket.on("markAsRead", async ({ userId, senderId }) => {
		try {
			await pool.query(
				"UPDATE messages SET is_read = TRUE WHERE receiver_id = $1 AND sender_id = $2",
				[userId, senderId]
			);
			console.log(`✅ Messages from ${senderId} marked as read.`);
		} catch (error) {
			console.error("❌ Error marking messages as read:", error.message);
		}
	});

	console.log(`🟢 New WebSocket Connection: ${socket.id}`);

	socket.on("disconnect", () => {
		clearInterval(heartbeat);
		console.log(`🔴 WebSocket Disconnected: ${socket.id}`);
	});
});

// ✅ 13. Database Connection Test
pool.query("SELECT NOW()", (err, res) => {
	if (err) {
		console.error("❌ Database Connection Error:", err);
	} else {
		console.log("📅 Database Time:", res.rows[0]);
	}
});

// ✅ 14. Check if Environment Variables are Loaded
console.log("🔍 Checking Environmental Variables:");
console.log(
	"MAILGUN_API_KEY:",
	process.env.MAILGUN_API_KEY ? "✅ Loaded" : "❌ Not Found"
);
console.log(
	"MAILGUN_DOMAIN:",
	process.env.MAILGUN_DOMAIN ? "✅ Loaded" : "❌ Not Found"
);
console.log(
	"MAILGUN_FROM:",
	process.env.MAILGUN_FROM ? "✅ Loaded" : "❌ Not Found"
);
