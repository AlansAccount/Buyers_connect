import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import {
	MAIN_PROPERTY_TYPES,
	SUB_PROPERTY_TYPES,
} from "../../constants/propertyConstants";
import { UserContext } from "@/context/UserContext";

const AgentRegisterPage: React.FC = () => {
	const router = useRouter();
	const { user } = useContext(UserContext);
	const [step, setStep] = useState(0);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",

		license_number: "",
		experience_years: 0,
		specialties: [] as string[],
		qualifications: [] as string[],
		languages_spoken: [] as string[],
		bio: "",
		firm_name: "",
		registration_number: "",
		country: "",
		city: "",
		street_address: "",
		post_code: "",
		license_files: [] as File[],
	});
	const [message, setMessage] = useState("");

	const handleSubmit = async () => {
		// Validate password match.
		if (formData.password !== formData.confirmPassword) {
			alert("Passwords do not match.");
			return;
		}

		try {
			const payload = new FormData();
			// Append account creation fields.
			payload.append("name", formData.fullName);
			payload.append("email", formData.email);
			payload.append("password", formData.password);
			payload.append("license_number", formData.license_number);
			payload.append("experience_years", formData.experience_years.toString());
			payload.append("bio", formData.bio);
			payload.append("firm_name", formData.firm_name);
			payload.append("registration_number", formData.registration_number);
			payload.append("country", formData.country);
			payload.append("city", formData.city);
			payload.append("street_address", formData.street_address);
			payload.append("post_code", formData.post_code);
			// Append arrays in JSON form so the backend can parse them
			payload.append("specialty", JSON.stringify(formData.specialties));
			payload.append("qualifications", JSON.stringify(formData.qualifications));
			payload.append(
				"languages_spoken",
				JSON.stringify(formData.languages_spoken)
			);
			// Append files
			formData.license_files.forEach((file) =>
				payload.append("license_files", file)
			);

			const res = await fetch("http://localhost:5000/api/agents/register", {
				method: "POST",

				body: payload,
			});

			const result = await res.json();
			if (res.ok) {
				setMessage(
					"Your registration has been submitted. Please await admin verification."
				);
				// Optionally clear the form here.
			} else {
				alert("Error: " + result.message);
			}
			router.push("/dashboard");
		} catch (err) {
			console.error("Submission Failed", err);
			alert("Something went wrong.");
		}
	};

	return (
		<div className="max-w-3xl mx-auto py-10 px-4">
			<h1 className="text-3xl font-bold mb-6">Agent Registration</h1>
			<p className="text-gray-700 mb-6">
				Please fill out this form to register as an agent.
			</p>

			{/* Navigation Buttons for Multi-step Form */}
			<div className="flex justify-between my-6">
				{step > 0 && (
					<button
						onClick={() => setStep(step - 1)}
						className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
					>
						Back
					</button>
				)}

				{step < 5 && (
					<button
						onClick={() => setStep(step + 1)}
						className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					>
						Next
					</button>
				)}

				{step === 5 && (
					<button
						onClick={handleSubmit}
						className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
					>
						Submit
					</button>
				)}
			</div>

			{/* Step 0: Account Information */}
			{step === 0 && (
				<div className="space-y-6">
					<h2 className="text-xl font-bold">Step 1: Account Information</h2>
					<label className="block">
						Full Name
						<input
							type="text"
							value={formData.fullName}
							onChange={(e) =>
								setFormData({ ...formData, fullName: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
					<label className="block">
						Email
						<input
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
					<label className="block">
						Password
						<input
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
					<label className="block">
						Repeat Password
						<input
							type="password"
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData({ ...formData, confirmPassword: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
				</div>
			)}

			{/* Step 1: Agent Basics */}
			{step === 1 && (
				<div className="space-y-6">
					<h2 className="text-xl font-bold">Step 2: Agent Basics</h2>
					<label className="block">
						License Number
						<input
							type="text"
							value={formData.license_number}
							onChange={(e) =>
								setFormData({ ...formData, license_number: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
					<label className="block">
						Years of Experience
						<input
							type="number"
							value={formData.experience_years}
							onChange={(e) =>
								setFormData({
									...formData,
									experience_years: Number(e.target.value),
								})
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							min={0}
							required
						/>
					</label>
					<label className="block">
						Bio (Short Introduction)
						<textarea
							value={formData.bio}
							onChange={(e) =>
								setFormData({ ...formData, bio: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							rows={4}
							required
						/>
					</label>
					<label className="block">
						Languages Spoken
						<input
							type="text"
							placeholder="Comma-separated: e.g. English, Spanish, Mandarin"
							onChange={(e) =>
								setFormData({
									...formData,
									languages_spoken: e.target.value
										.split(",")
										.map((s) => s.trim()),
								})
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
				</div>
			)}

			{/* Step 2: Specialties */}
			{step === 2 && (
				<div className="space-y-6">
					<h2 className="text-xl font-bold">Step 3: Specialties</h2>
					<p className="text-gray-600">
						Select the property types you specialize in. You may choose
						multiple.
					</p>
					{MAIN_PROPERTY_TYPES.map((main) => (
						<div key={main}>
							<label className="font-semibold block mb-2">{main}</label>
							<div className="flex flex-wrap gap-2">
								{SUB_PROPERTY_TYPES.find(
									(s) => s.category === main
								)?.subTypes.map((sub) => (
									<button
										type="button"
										key={sub}
										onClick={() => {
											const exists = formData.specialties.includes(sub);
											setFormData({
												...formData,
												specialties: exists
													? formData.specialties.filter((s) => s !== sub)
													: [...formData.specialties, sub],
											});
										}}
										className={`px-3 py-1 rounded border ${
											formData.specialties.includes(sub)
												? "bg-blue-500 text-black"
												: "bg-white text-black"
										}`}
									>
										{sub}
									</button>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Step 3: Company/Firm Info */}
			{step === 3 && (
				<div className="space-y-6">
					<h2 className="text-xl font-bold">Step 4: Company / Firm Info</h2>
					<label className="block">
						Firm Name
						<input
							type="text"
							value={formData.firm_name}
							onChange={(e) =>
								setFormData({ ...formData, firm_name: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
					<label className="block">
						Registration Number
						<input
							type="text"
							value={formData.registration_number}
							onChange={(e) =>
								setFormData({
									...formData,
									registration_number: e.target.value,
								})
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
							required
						/>
					</label>
					<label className="block">
						Country
						<input
							type="text"
							value={formData.country}
							onChange={(e) =>
								setFormData({ ...formData, country: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
					<label className="block">
						City
						<input
							type="text"
							value={formData.city}
							onChange={(e) =>
								setFormData({ ...formData, city: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
					<label className="block">
						Street Address
						<input
							type="text"
							value={formData.street_address}
							onChange={(e) =>
								setFormData({ ...formData, street_address: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
					<label className="block">
						Post Code
						<input
							type="text"
							value={formData.post_code}
							onChange={(e) =>
								setFormData({ ...formData, post_code: e.target.value })
							}
							className="mt-1 block w-full border rounded px-4 py-2 text-black"
							required
						/>
					</label>
				</div>
			)}

			{/* Step 4: File Upload */}
			{step === 4 && (
				<div className="space-y-6">
					<label className="block">
						Upload License & Supporting Files
						<input
							type="file"
							accept=".pdf, image/*"
							multiple
							onChange={(e) => {
								const files = Array.from(e.target.files || []);
								const validFiles = files.filter(
									(file) => file.size <= 5 * 1024 * 1024
								); // 5MB limit
								if (validFiles.length > 5) {
									alert("You can only upload up to 5 files.");
									return;
								}
								setFormData({ ...formData, license_files: validFiles });
							}}
							className="mt-1 block w-full border rounded px-4 py-2 bg-white text-black"
						/>
						{formData.license_files.length > 0 && (
							<div className="mt-3 space-y-2">
								<h4 className="font-semibold text-gray-700">Preview:</h4>
								<ul className="space-y-2">
									{formData.license_files.map((file, index) => (
										<li key={index} className="flex items-center gap-4">
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
												onClick={() => {
													const updated = [...formData.license_files];
													updated.splice(index, 1);
													setFormData({ ...formData, license_files: updated });
												}}
												className="text-red-500 text-xs hover:underline ml-2"
											>
												Remove
											</button>
										</li>
									))}
								</ul>
							</div>
						)}
					</label>
				</div>
			)}

			{/* Step 5: Review & Consent */}
			{step === 5 && (
				<div className="space-y-6">
					<h2 className="text-xl font-bold">Step 5: Review & Consent</h2>
					<p className="text-gray-600">
						Please review your details before submitting. Your registration will
						be submitted and will await admin verification.
					</p>
					<div className="bg-gray-50 border p-4 rounded text-black shadow text-sm space-y-1">
						<p>
							<strong>Full Name:</strong> {formData.fullName}
						</p>
						<p>
							<strong>Email:</strong> {formData.email}
						</p>
						<p>
							<strong>License #:</strong> {formData.license_number}
						</p>
						<p>
							<strong>Years Experience:</strong> {formData.experience_years}
						</p>
						<p>
							<strong>Languages:</strong>{" "}
							{Array.isArray(formData.languages_spoken)
								? formData.languages_spoken.join(", ")
								: ""}
						</p>
						<p>
							<strong>Specialties:</strong> {formData.specialties.join(", ")}
						</p>
						<p>
							<strong>Firm:</strong> {formData.firm_name} (#
							{formData.registration_number})
						</p>
						<p>
							<strong>Location:</strong> {formData.street_address},{" "}
							{formData.city}, {formData.country}, {formData.post_code}
						</p>
						<p>
							<strong>Uploaded Files:</strong> {formData.license_files.length}
						</p>
					</div>
					<label className="block">
						<input type="checkbox" required className="mr-2" /> I confirm all
						details are true and agree to terms of agent onboarding.
					</label>
				</div>
			)}

			{message && <p className="text-green-600 mt-4">{message}</p>}
		</div>
	);
};

export default AgentRegisterPage;
