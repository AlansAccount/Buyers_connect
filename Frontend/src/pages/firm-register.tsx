import { useState } from "react";
import { useRouter } from "next/router";

const FirmRegisterPage: React.FC = () => {
	const router = useRouter();
	const [firm_docs, setFirmDocs] = useState<File[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		repeatPassword: "",
		registration_number: "",
		country: "",
		city: "",
		street_address: "",
		post_code: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.password !== formData.repeatPassword) {
			alert("Passwords do not match.");
			return;
		}

		try {
			const payload = new FormData();

			for (const key in formData) {
				if (key !== "repeatPassword") {
					payload.append(key, formData[key as keyof typeof formData]);
				}
			}

			firm_docs.forEach((file) => {
				payload.append("firm_docs", file);
			});

			const res = await fetch(
				"http://localhost:5000/api/firms/firm-registration",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: payload,
				}
			);

			const result = await res.json();
			if (res.ok) {
				alert("Firm registration submitted.");
				router.push("/login");
			} else {
				alert("Error: " + result.message);
			}
		} catch (err) {
			console.error("Registration error", err);
			alert("Unexpected error occurred.");
		}
	};

	return (
		<div className="max-w-2xl mx-auto py-10 px-4">
			<h1 className="text-3xl font-bold mb-6">🏢 Firm Registration</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="text"
					name="name"
					placeholder="Firm Name"
					value={formData.name}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
					required
				/>
				<input
					type="email"
					name="email"
					placeholder="Primary Firm Email"
					value={formData.email}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
					required
				/>
				<input
					type="password"
					name="password"
					placeholder="Password"
					value={formData.password}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
					required
				/>
				<input
					type="password"
					name="repeatPassword"
					placeholder="Repaet Your Password"
					value={formData.password}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
					required
				/>
				<input
					type="text"
					name="registration_number"
					placeholder="Business Registration Number"
					value={formData.registration_number}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
				/>
				<input
					type="text"
					name="country"
					placeholder="Country"
					value={formData.country}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
				/>
				<input
					type="text"
					name="city"
					placeholder="City"
					value={formData.city}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
				/>
				<input
					type="text"
					name="street_address"
					placeholder="Street Address"
					value={formData.street_address}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
				/>
				<input
					type="text"
					name="post_code"
					placeholder="Post Code"
					value={formData.post_code}
					onChange={handleChange}
					className="w-full border px-4 py-2 rounded"
				/>
				<label className="block">
					Upload Verification Documents (PDF or Image)
					<input
						type="file"
						accept=".pdf,image/*"
						multiple
						onChange={(e) => {
							const files = Array.from(e.target.files || []);
							const valid = files.filter(
								(file) => file.size <= 5 * 1024 * 1024
							);
							if (valid.length > 5) {
								alert("You can only upload up to 5 files.");
								return;
							}
							setFirmDocs(valid);
						}}
						className="mt-1 block w-full border rounded px-4 py-2 bg-white"
					/>
				</label>
				{firm_docs.length > 0 && (
					<div className="mt-3 space-y-2">
						<h4 className="font-semibold text-gray-700">Preview:</h4>
						<ul className="space-y-2">
							{firm_docs.map((file, i) => (
								<li key={i} className="flex items-center gap-4">
									{file.type.startsWith("image/") ? (
										<img
											src={URL.createObjectURL(file)}
											alt={file.name}
											className="w-16 h-16 object-cover rounded"
										/>
									) : (
										<div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-sm font-medium text-gray-600">
											PDF
										</div>
									)}
									<p className="text-sm">{file.name}</p>
									<button
										type="button"
										onClick={() =>
											setFirmDocs((prev) => prev.filter((_, j) => j !== i))
										}
										className="text-red-500 text-xs hover:underline"
									>
										Remove
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
				<button
					type="submit"
					className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
				>
					Submit
				</button>
			</form>
		</div>
	);
};

export default FirmRegisterPage;
