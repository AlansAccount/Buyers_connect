import cron from "node-cron";
import pool from "./config/db.js";

//This job runs every day at midnight.
cron.schedule("0 0 * * *", async () => {
	console.log("Running CRON: Expire outdated forms");

	try {
		const result = await pool.query(
			`UPDATE buyer_questionnaires
             SET is_active = false
             WHERE is_active = true
             AND expires_at IS NOT NULL
             AND expires_at < NOW()`
		);

		console.log(`CRON complete: ${result.rowCount} forms(s) marked inactive.`);
	} catch (err) {
		console.error("CRON error: ", err.message);
	}
});
