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
import authRoutes from "./src/routes/authRoutes.js";
import propertyRoutes from "./src/routes/propertyRoutes.js";
import pool from "./src/config/db.js";
import { apiLimiter } from "./src/middlewares/limitMiddleware.js";
import logger from "./src/utils/logger.js";

// ✅ 4. Create an Express Application
const app = express();

// ✅ 5. Middleware Setup
app.use(cors()); // Enable CORS
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
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

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

// ✅ 11. WebSocket Events
io.on("connection", (socket) => {
	console.log(`🟢 WebSocket Connected: ${socket.id}`);

	// When a user conencts, they must join their own room.
	socket.on("joinRoom", (userId) => {
		socket.join(`user-${userId}`);
		console.log(`User ${userId} joined room user-${userId}`);
	});

	socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
		try {
			// Store message in DB
			const result = await pool.query(
				"INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
				[senderId, receiverId, content]
			);

			const message = result.rows[0];

			// Emit message to receiver
			io.to(`user-${receiverId}`).emit(`message-${receiverId}`, message);

			console.log(`📩 Message Sent: ${message.content}`);

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
