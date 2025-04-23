import { useEffect, useState } from "react";
import { Disclosure, Menu } from "@headlessui/react";

const FormsDashboardPage = () => {
	const [forms, setForms] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortKey, setSortKey] = useState<"submitted_at" | "budget_max">(
		"submitted_at"
	);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
	const [draft, setDraft] = useState<any | null>(null);

	const handleDelete = async (id: number) => {
		try {
			const res = await fetch(`http://localhost:5000/api/questionnaire/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (!res.ok) {
				alert("Failed to delete form.");
				return;
			}

			alert("Form deleted.");
			setForms(forms.filter((f) => f.id !== id));
		} catch (err) {
			console.error("Error deleting form:", err);
		}
	};

	const handleEmail = async (id: number) => {
		try {
			const res = await fetch(
				`http://localhost:5000/api/questionnaire/${id}/email`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);

			if (!res.ok) {
				alert("Failed to email form.");
				return;
			}

			alert("Form emailed to you successfully.");
		} catch (err) {
			console.error("Email error:", err);
		}
	};

	useEffect(() => {
		const fetchFormsAndDraft = async () => {
			try {
				const token = localStorage.getItem("token");

				// Fetch submitted forms
				const resForms = await fetch(
					"http://localhost:5000/api/questionnaire/submissions",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const submissions = await resForms.json();
				setForms(submissions);

				// Fetch draft
				const resDraft = await fetch(
					"http://localhost:5000/api/questionnaire",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (resDraft.ok) {
					const draftData = await resDraft.json();
					if (!draftData.is_completed) {
						setDraft(draftData);
					}
				}
			} catch (err) {
				console.error("Error fetching forms or draft:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchFormsAndDraft();
	}, []);

	const sortedForms = [...forms].sort((a, b) => {
		const aVal = a[sortKey];
		const bVal = b[sortKey];

		if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
		if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
		return 0;
	});

	return (
		<div className="max-w-5xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-4 text-white">
				Your Questionnaires
			</h1>
			{loading ? (
				<p className="text-gray-500">Loading...</p>
			) : (
				<div>
					{forms.length === 0 ? (
						<p className="text-gray-500">No forms found yet.</p>
					) : (
						<div className="space-y-4">
							<div>
								<span className="text-white text-sm font-medium">Sort by:</span>
								<button
									className={`px-3 py-1 rounded border ${
										sortKey === "submitted_at"
											? "bg-blue-100 border-blue-300"
											: "border-gray-900"
									}`}
									onClick={() => {
										setSortKey("submitted_at");
										setSortDirection((prev) =>
											prev === "asc" ? "desc" : "asc"
										);
									}}
								>
									Date{" "}
									{sortKey === "submitted_at"
										? sortDirection === "asc"
											? "↑"
											: "↓"
										: ""}
								</button>
								<button
									className={`px-3 py-1 rounded border ${
										sortKey === "budget_max"
											? "bg-blue-100 border-blue-300"
											: "border-gray-900"
									}`}
									onClick={() => {
										setSortKey("budget_max");
										setSortDirection((prev) =>
											prev === "asc" ? "desc" : "asc"
										);
									}}
								>
									Max Budget{" "}
									{sortKey === "budget_max"
										? sortDirection === "asc"
											? "↑"
											: "↓"
										: ""}
								</button>
							</div>
							{draft && (
								<div className="mb-6 border border-yellow-400 rounded p-4 bg-yellow-50">
									<h2 className="text-lg font-semibold text-yellow-800 mb-2">
										📝 Draft In Progress
									</h2>
									<p className="text-sm text-yellow-700">
										Last updated:{" "}
										{new Date(draft.last_updated).toLocaleString()}
									</p>
									<p className="text-sm text-yellow-700 mt-2">
										Click below to resume your incomplete questionnaire.
									</p>
									<a
										href="/questionnaire"
										className="inline-block mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
									>
										Continue Draft
									</a>
								</div>
							)}

							{sortedForms.map((form) => (
								<Disclosure key={form.id}>
									{({ open }) => (
										<>
											<Disclosure.Button className="w-full flex text-black justify-between items-center bg-gray-100 px-4 py-3 rounded hover:bg-gray-200">
												<span>
													📝 {form.title || "Untitled Form"}
													{form.status || " - Form Status Unknown"}
												</span>
												<span className="text-sm text-black text-underline">
													Last updated:
													{/* {new Date(form.submitted_at).toLocaleDateString()} */}
													{new Date(form.submitted_at).toLocaleString()}
												</span>
											</Disclosure.Button>
											<Disclosure.Panel className="p-4 bg-gray-50 border border-gray-300 rounded text-gray-800">
												<div className="text-sm overflow-x-auto">
													<div className="flex justify-end mb-4">
														<Menu
															as="div"
															className="relative inline-block text-left"
														>
															<div>
																<Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
																	...
																</Menu.Button>
															</div>
															<Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
																<div className="p-1">
																	<Menu.Item>
																		{({ active }) => (
																			<button
																				onClick={() => handleDelete(form.id)}
																				className={`${
																					active
																						? "bg-red-100 text-red-800"
																						: "text-red-700"
																				} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
																			>
																				🗑 Delete
																			</button>
																		)}
																	</Menu.Item>
																	<Menu.Item>
																		{({ active }) => (
																			<button
																				onClick={() => window.print()}
																				className={`${
																					active ? "bg-gray-100" : ""
																				} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
																			>
																				🖨 Print
																			</button>
																		)}
																	</Menu.Item>
																	<Menu.Item>
																		{({ active }) => (
																			<button
																				onClick={() => handleEmail(form.id)}
																				className={`${
																					active ? "bg-gray-100" : ""
																				} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
																			>
																				📤 Email to me
																			</button>
																		)}
																	</Menu.Item>
																</div>
															</Menu.Items>
														</Menu>
													</div>
													<div className="grid grid-cols-2 gap-4 text-sm">
														<div>
															<strong>Budget:</strong> ${form.budget}
														</div>
														<div>
															<strong>Location:</strong>
															{form.location || "N/A"}
														</div>
														<div>
															<strong>Property Type:</strong>
															{form.property_main_type} /
															{form.property_sub_type}
														</div>
														<div>
															<strong>Mortgage:</strong> {form.mortgage_status}
														</div>
														<div>
															<strong>Purchase Timeline:</strong>
															{form.purchase_timeline}
														</div>
														<div>
															<strong>Goals:</strong>
															{form.goals?.join(", ") || "N/A"}
														</div>
														<div>
															<strong>Importance:</strong>
															{form.importance_rank?.join(", ") || "N/A"}
														</div>
														<div>
															<strong>Experience Rating:</strong>
															{form.experience_rating || "N/A"}
														</div>
														<div className="col-span-2">
															<strong>Feedback:</strong>
															<p className="mt-1">
																{form.feedback || "None given."}
															</p>
														</div>
													</div>
												</div>
											</Disclosure.Panel>
										</>
									)}
								</Disclosure>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default FormsDashboardPage;
