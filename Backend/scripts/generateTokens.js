import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const users = [
	{ id: 1, email: "user1@example.com" },
	{ id: 2, email: "user2@example.com" },
];

users.forEach((user) => {
	const token = jwt.sign(
		{ id: user.id, email: user.email },
		process.env.JWT_SECRET,
		{ expiresIn: "7d" }
	);

	console.log(`JWT for User ${user.id}:`);
	console.log(token);
	console.log("--------");
});
