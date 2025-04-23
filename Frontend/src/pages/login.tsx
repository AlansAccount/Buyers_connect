import { useState } from "react";
import { useRouter } from "next/router";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();
	const { setUser } = useContext(UserContext);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch("http://localhost:5000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Login Failed.");
			}

			setUser({
				id: data.id,
				email: data.email,
				role: data.role,
				token: data.token,
			});

			localStorage.setItem("token", data.token);
			// setUser(data);

			// Refresh the page or redirect.
			router.push("/dashboard"); // Or Where ever I want to redirect.
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<main className="flex items-center justify-center min-h-screen bg-gray-100">
			<section className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
				<form onSubmit={handleSubmit}>
					<header className="text-black text-2xl font-bold ">Login.</header>
					<input
						type="text"
						placeholder="Enter your email."
						className="p-3 w-80 md:w-auto border border-gray-400 rounded-lg text-black"
						onChange={(e) => setEmail(e.target.value)}
					/>
					<input
						type="password"
						placeholder="Enter password."
						onChange={(e) => setPassword(e.target.value)}
						className="p-3 w-80 md:w-auto border border-gray-400 rounded-lg text-black"
					/>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg"
					>
						Login
					</button>

					{error && <p className="text-red-500">{error}</p>}
				</form>
			</section>
		</main>
	);
};

export default Login;
