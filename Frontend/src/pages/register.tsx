import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const Register = () => {
	const [form, setForm] = useState({
		email: "",
		fullName: "",
		dob: "",
		password: "",
		confirmPassword: "",
		role: "buyer", // Default.
	});
	const [error, setError] = useState("");
	const router = useRouter();

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (form.password !== form.confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		try {
			const res = await fetch("http://localhost:5000/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: form.email,
					password: form.password,
					name: form.fullName,
					dob: form.dob,
					role: "buyer", // OR "Agent" - Will need to be edited later to accomodate the specfic form.
				}),
			});

			const data = await res.json();

			if (!res.ok) throw new Error(data.message || "Registration Failed.");

			localStorage.setItem("token", data.token);
			router.push("/dashboard");
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<main className="flex items-center justify-center min-h-screen bg-gray-100">
			<section className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
				<form onSubmit={handleSubmit}>
					<header className="text-black text-2xl font-bold">Register.</header>

					<input
						name="email"
						type="text"
						placeholder="Enter your email."
						value={form.email}
						onChange={handleChange}
						className="p-3 border rounded text-black w-80"
						required
					/>
					<input
						name="fullName"
						type="text"
						placeholder="Enter Full Name."
						value={form.fullName}
						onChange={handleChange}
						required
						className="p-3 border rounded text-black w-80"
					/>
					<input
						name="dob"
						type="date"
						value={form.dob}
						onChange={handleChange}
						required
						className="p-3 border rounded text-black w-80"
					/>
					<input
						name="password"
						type="password"
						placeholder="Enter password."
						value={form.password}
						onChange={handleChange}
						required
						className="p-3 border rounded text-black w-80"
					/>
					<input
						name="confirmPassword"
						type="password"
						placeholder="Repeat password."
						value={form.confirmPassword}
						required
						onChange={handleChange}
						className="p-3 border rounded text-black w-80"
					/>

					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded w-80"
					>
						Register
					</button>
					<p className="text-sm text-gray-600 mt-4">
						Want to register as an agent?
						<Link href="/agent-register">
							<button className="text-blue-600 underline">Click here</button>
						</Link>
					</p>
					{error && <p className="text-red-500">{error}</p>}
				</form>
			</section>
		</main>
	);
};

export default Register;
