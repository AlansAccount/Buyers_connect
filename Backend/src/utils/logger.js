import { createLogger, format, transports } from "winston";
import path from "path";
import { logToDatabase } from "../config/db.js";

// Define log format (Timestamp + Message).
const logFormat = format.combine(
	format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	format.printf(({ timestamp, level, message }) => {
		return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
	})
);

// Create a logger instance
const logger = createLogger({
	level: "info", // Log levels: error, warn, info, http, debug.
	format: logFormat,
	transports: [
		new transports.File({
			filename: path.join("logs", "error.log"),
			level: "error",
		}), // Log errors to error.log
		new transports.File({ filename: path.join("logs", "combine.log") }), // Log everything
	],
});

// If in development mode, log to console.
if (process.env.NODE_ENV !== "production") {
	logger.add(new transports.Console({ format: logFormat }));
}

logger.on("data", (log) => {
	logToDatabase(log.level, log.message);
});

export default logger;
