import rateLimit from "express-rate-limit";

// Limit login attempts (Max 5 per 10 minutes)
export const loginLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 5, // Limit each IP to 5 requests per windowsMs
	message: "Too many login attempts. Please try again later.",
	standardHeaders: true, // Return rate limit info headers
	legacyHeaders: false, // Disable lecagy HTTP headers
});

// Limit requests on the entire API (Max 100 per 15 minutes).
export const apiLimiter = rateLimit({
	windowsMs: 15 * 60 * 1000, // 15 minutes.
	max: 100, // Limit each IP to 100 requests per windowsMs.
	message: "Too many requests. Slow Down.",
	standardHeaders: true,
	legacyHeaders: false,
});
