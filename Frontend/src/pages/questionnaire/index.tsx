import { useState, useEffect } from "react";
import { TwoLevelSelect } from "@/components/property_selectors/TwoDropdown";
import { useRouter } from "next/router";

const totalSteps = 4;

const initialFormData = {
	budget: "",
	location: "",
	owns_property: "",
	property_main_type: "",
	property_sub_type: "",
	is_international: "",
	country: "",
	city: "",
	mortgage_status: "",
	purchase_timeline: "",
	goals: [] as string[],
	importance_rank: [] as string[],
	experience_rating: "",
	feedback: "",
};

const QuestionnairePage: React.FC = () => {
	const [step, setStep] = useState(0);
	const [formData, setFormData] = useState(initialFormData);
	const router = useRouter();

	useEffect(() => {
		const fetchDraft = async () => {
			try {
				const res = await fetch("http://localhost:5000/api/questionnaire", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				});

				if (!res.ok) return;

				const data = await res.json();
				console.log("Loaded draft data:", data);
				setFormData(data);
			} catch (err) {
				console.error("Failt to load draft", err);
			}
		};
		fetchDraft();
	}, []);

	const saveAndExit = async (isFinal: boolean) => {
		try {
			console.log("Submitting form...", { formData, isFinal });

			const res = await fetch("http://localhost:5000/api/questionnaire", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ ...formData, is_complete: isFinal }),
			});

			if (isFinal) {
				// if 'isFinal' is true is what this says, and 'isFinal' is boolean i.e. true or false.
				router.push("/questionnaire/complete");
			} else {
				router.push("/"); // or the Dashboard page.
			}
		} catch (err) {
			alert("Failed to save progress.");
		}
	};

	const handleSubmit = async () => {
		try {
			const res = await fetch("http://localhost:5000/api/questionnaire", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // ✅ fixed typo
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(formData),
			});

			const contentType = res.headers.get("content-type");

			if (!res.ok) {
				if (contentType && contentType.includes("application/json")) {
					const data = await res.json();
					console.error("Submission Error:", data.message);
				} else {
					const text = await res.text();
					console.error("Unexpected Error Response:", text);
				}
				alert("Submission Failed. Please Try Again.");
				return;
			}

			alert("✅ Questionnaire submitted successfully!");
			router.push("/questionnaire/complete");
		} catch (err) {
			console.error("Network Error:", err);
			alert("There was a problem. Please Check Your Connection.");
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-10">
			<div className="text-center mb-6 text-sm text-gray-500">
				Step {step + 1} of {totalSteps}
			</div>
			<h1 className="text-3xl font-bold mb-6 text-center">
				Buyer Questionnaire
			</h1>
			<div className="flex justify-end mb-4">
				<button
					onClick={() => saveAndExit(false)}
					className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
				>
					💾 Save Progress
				</button>
			</div>

			{/*  Placeholder - will render dyncamic steps here soon. */}
			<div className="text-center text-gray-600">
				{step === 0 && (
					<div className="space-y-4">
						{/*  */}
						<label className="block text-gray-700 font-medium">
							What is your estimated budget?
						</label>
						<select
							name="budget"
							value={formData.budget}
							onChange={(e) =>
								setFormData({
									...formData,
									budget: e.target.value,
								})
							}
							className="w-full p-3 border border-gray-300 rounded"
						>
							{/* Options probably must change based on property type and location/country. 
							The displayed currency must change base one location/manual displayed currency. */}
							<option value="">Select your budget range...</option>
							<option value="(,150000]">Upto $150,000</option>
							<option value="[150000,250000]">$150,000 - $250,000</option>
							<option value="[250000,400000]">$250,000 - $400,000</option>
							<option value="[400000,550000]">$400,000 - $550,000</option>
							<option value="[550000,700000]">$550,000 - $700,000</option>
							<option value="[700000,850000]">$700,000 - $850,000</option>
							<option value="[850000,1000000]">$850,000 - $1,000,000</option>
							<option value="[1000000,1250000]">$1,000,000 - $1,250,000</option>
							<option value="[1250000,1500000]">$1,250,000 - $1,500,000</option>
							<option value="[1500000,2000000]">$1,500,000 - $2,000,000</option>
							<option value="[2000000,)">$2,000,000 or greater.</option>
						</select>

						{/*  */}
						<div className="flex justify-between mt-6">
							<button
								disabled={step === 0}
								onClick={() => setStep(step - 1)}
								className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
							>
								Back
							</button>
							<button
								disabled={!formData.budget}
								onClick={() => setStep(step + 1)}
								className={`${
									!formData.budget
										? "bg-blue-300 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700"
								} text-white px-4 py-2 rounded transition`}
							>
								Next
							</button>
						</div>
					</div>
				)}
				{step === 1 && (
					<div className="space-y-4 animate-fade">
						<label className="block text-gray-700 font-medium">
							Where do you currently live?
						</label>
						<input
							type="text"
							value={formData.location}
							onChange={(e) =>
								setFormData({ ...formData, location: e.target.value })
							}
							className="w-full p-3 border border-gray-300 rounded"
						/>

						<label className="block text-gray-700 font-medium">
							Do you currently own property?
						</label>
						<select
							value={formData.owns_property}
							onChange={(e) =>
								setFormData({ ...formData, owns_property: e.target.value })
							}
							className="w-full p-3 border border-gray-300 rounded"
						>
							<option value="">Select...</option>
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>

						<label className="block text-gray-700 font-medium">
							What type of property are you interested in?
						</label>
						<TwoLevelSelect
							mainValue={formData.property_main_type}
							subValue={formData.property_sub_type}
							onChangeMain={(val) =>
								setFormData({ ...formData, property_main_type: val })
							}
							onChangeSub={(val) =>
								setFormData({ ...formData, property_sub_type: val })
							}
						/>

						<div className="flex justify-between mt-6">
							<button
								onClick={() => setStep(step - 1)}
								className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
							>
								Back
							</button>

							<button
								disabled={
									!formData.location ||
									!formData.owns_property ||
									!formData.property_main_type ||
									!formData.property_sub_type
								}
								onClick={() => setStep(step + 1)}
								className={`${
									!formData.location ||
									!formData.owns_property ||
									!formData.property_main_type ||
									!formData.property_sub_type
										? "bg-blue-300 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700"
								} text-white px-4 py-2 rounded transition`}
							>
								Next
							</button>
						</div>
					</div>
				)}
				{step === 2 && (
					<div className="space-y-4 animate-fade">
						<label className="block text-gray-7000 font-medium">
							When are you looking to purchase?
						</label>
						<select
							value={formData.purchase_timeline}
							onChange={(e) =>
								setFormData({ ...formData, purchase_timeline: e.target.value })
							}
							className="w-full p-3 border border-gray-300 rounded"
						>
							<option value="">Select a time frame</option>
							<option value="1_month">Within 1 Months</option>
							<option value="3_month">Within 3 Months</option>
							<option value="6_month">Within 6 Months</option>
							<option value="12_month">Within 12 Months</option>
							<option value="undecided">Not sure yet</option>
							<option value="asap">ASAP</option>
						</select>
						<label className="block text-gray-700 font-medium">
							Are you pre-approved for a mortgage?
						</label>
						<select
							value={formData.mortgage_status}
							onChange={(e) =>
								setFormData({ ...formData, mortgage_status: e.target.value })
							}
							className="w-full p-3 border border-gray-300 rounded"
						>
							<option value="">Select...</option>
							<option value="pre_approved">Yes - Pre-approved.</option>
							<option value="not-yet">No - Not yet.</option>
							<option value="cash_buyer">I'm paying with cash</option>
						</select>
						<label className="block text-gray-700 font medium">
							If not your country of residence, are you looking in another
							country to buy in?
						</label>
						<select
							value={formData.is_international}
							onChange={(e) =>
								setFormData({ ...formData, is_international: e.target.value })
							}
							className="w-full p-3 border border-gray-300 rounded"
						>
							<option value="">Select...</option>
							<option value="yes">Yes</option>
							<option value="no">No</option>
							<option value="not_sure">Not sure</option>
						</select>
						{/* Show more questions if they select yes */}
						{formData.is_international === "yes" && (
							<>
								<label className="block text-gray-700 font-medium">
									Which country are you looking to buy in?
								</label>
								<input
									type="text"
									value={formData.country}
									onChange={(e) =>
										setFormData({ ...formData, country: e.target.value })
									}
									className="w-full p-3 border border-gray-300 rounded"
								/>
								<label className="block text-gray-700 font-medium">
									Which city or suburb?
								</label>
								<input
									type="text"
									value={formData.city}
									onChange={(e) =>
										setFormData({ ...formData, city: e.target.value })
									}
									className="w-full p-3 border border-gray-300 rounded"
								/>
							</>
						)}
						{/* Buttons */}
						<div className="flex justify-between mt-6">
							<button
								onClick={() => setStep(step - 1)}
								className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
							>
								Back
							</button>

							<button
								disabled={
									!formData.purchase_timeline || !formData.mortgage_status
								}
								onClick={() => setStep(step + 1)}
								className={`${
									!formData.purchase_timeline || !formData.mortgage_status
										? "bg-blue-300 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700"
								} text-white px-4 py-2 rounded transition`}
							>
								Next
							</button>
						</div>
					</div>
				)}
				{step === 3 && (
					<div className="space-y-4 animate-fade">
						<label className="block text-gray-700 font-medium">
							What are your investment or purchase goals?
						</label>
						<select
							value={formData.goals[0] || ""}
							onChange={(e) =>
								setFormData({ ...formData, goals: [e.target.value] })
							}
							className="w-full p-3 border border-gray-300 rounded"
						>
							<option value="">Select...</option>
							<option value="home_to_live">A home to live in</option>
							<option value="rental_income">
								Rental income / passive cashflow
							</option>
							<option value="capital_growth">Capital appreciation</option>
							<option value="flip_and_sell">Fix & Flip</option>
							<option value="holiday_home">Holiday home / seasonal use</option>
							<option value="not_sure">Not sure yet</option>
						</select>

						<label className="block text-gray-700 font-medium">
							What’s most important to you?
						</label>
						<select
							value={formData.importance_rank[0] || ""}
							onChange={(e) =>
								setFormData({ ...formData, importance_rank: [e.target.value] })
							}
							className="w-full p-3 border border-gray-300 rounded"
						>
							<option value="">Select...</option>
							<option value="budget">Staying within budget</option>
							<option value="location">Great location</option>
							<option value="returns">High rental returns</option>
							<option value="growth">Long-term capital growth</option>
							<option value="speed">Speed of transaction</option>
						</select>

						<label className="block text-gray-700 font-medium">
							How did you find this questionnaire experience? (1 = terrible, 10
							= great)
						</label>
						<input
							type="number"
							min={1}
							max={10}
							value={formData.experience_rating}
							onChange={(e) =>
								setFormData({ ...formData, experience_rating: e.target.value })
							}
							className="w-full p-3 border border-gray-300 rounded"
						/>

						<label className="block text-gray-700 font-medium">
							Anything you'd like to add? (Optional)
						</label>
						<textarea
							value={formData.feedback}
							onChange={(e) =>
								setFormData({ ...formData, feedback: e.target.value })
							}
							placeholder="Your feedback helps us improve..."
							rows={4}
							className="w-full p-3 border border-gray-300 rounded"
						/>

						{/* Buttons */}
						<div className="flex justify-between mt-6">
							<button
								onClick={() => setStep(step - 1)}
								className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
							>
								Back
							</button>
							<button
								disabled={
									!formData.goals ||
									!formData.importance_rank ||
									!formData.experience_rating
								}
								onClick={handleSubmit}
								className={`${
									!formData.goals ||
									!formData.importance_rank ||
									!formData.experience_rating
										? "bg-blue-300 cursor-not-allowed"
										: "bg-green-600 hover:bg-green-700"
								} text-white px-4 py-2 rounded transition`}
							>
								Finish & Submit
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default QuestionnairePage;
