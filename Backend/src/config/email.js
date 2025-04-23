import formData from "form-data";
import dotenv from "dotenv";
import Mailgun from "mailgun.js";
import pool from "./db.js"; // For PostgreSQL DB Connection

dotenv.config();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
	username: "api",
	key: process.env.MAILGUN_API_KEY, // Load Mailgun API key from .env file
});

// List of Verified Emails (FOR TESTING PURPOSES ONLY)
const VERIFIED_EMAILS = ["asce3d2y17@gmail.com", "greenwooda124@gmail.com", 'greenwooda124@protonmail.com'];

/**
 * Sends an email using nodemailer.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Email body content.
 */

export const sendEmail = async (to, subject, text) => {
	try {
		// Check if email is verified (for free-tier accounts)
		if (!VERIFIED_EMAILS.includes(to)) {
			console.log(`Email to ${to} skipped (not verified in free-tier).`);
			await pool.query(
				"INSERT INTO email_logs (recipient_email, subject, status, error_message) VALUES ($1, $2, 'skipped', $3)",
				[to, subject, "Not an authorised recipient."]
			);
			return;
		}

		// Send Email
		const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
			from: `Buyers Agent Connect <${process.env.MAILGUN_FROM}>`, // Sender Email
			to, // Recipient email
			subject, // Email Subject
			text, // Email body
		});

		console.log(`Email send to ${to}:`, response.id);

		// Store success log in PostgreSQL
		await pool.query(
			"INSERT INTO email_logs (recipient_email, subject, status, response_id) VALUES ($1, $2, 'success', $3)",
			[to, subject, response.id]
		);
	} catch (error) {
		console.error(
			` Email sending failed:`,
			error.response?.body || error.message
		);

		// Store failure log in PostgreSQL
		await pool.query(
			"INSERT INTO email_logs (recipient_email, subject, status, error_message) VALUES ($1, $2, 'failure', $3)",
			[to, subject, error.message]
		);
	}
};
