import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";

const BuyerDashboard = () => {
	const router = useRouter();
	const { user } = useContext(UserContext);

	const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] =
		useState(false);

	useEffect(() => {
		if (!user) return;
		const fetchStatus = async () => {
			try {
				const res = await fetch(
					"http://localhost:5000/api/questionnaire/check",
					{
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					}
				);
				const data = await res.json();
				setHasCompletedQuestionnaire(data.is_complete); // Not data.completed
			} catch (err) {
				console.error("Error checking completion status", err);
			}
		};
		fetchStatus();
	}, []);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-white">Welcome Buyer 👋</h1>
			<p>
				You'll see you favourite agents, saved properties and messages, etc.
			</p>
			{!hasCompletedQuestionnaire ? (
				<button
					onClick={() => router.push("/questionnaire")}
					className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Start Your Buyer Form
				</button>
			) : (
				<div className="mt-4 space-x-4">
					<button
						onClick={() => router.push("/questionnaire")}
						className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
					>
						Resume / Update Form
					</button>
					<button
						onClick={() => router.push("/forms")}
						className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black"
					>
						View Past Submissions
					</button>
				</div>
			)}
		</div>
	);
};

export default BuyerDashboard;
