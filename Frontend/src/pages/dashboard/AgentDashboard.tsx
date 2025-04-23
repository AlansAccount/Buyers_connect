import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import Link from "next/link";

const AgentDashboard = () => {
	// Inside your page component
	const { user } = useContext(UserContext);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-white">Welcome Agent 🧑‍💼</h1>
			<p>Leads, property listings, and analytics will go here.</p>
			{user?.role === "agent" && (
				<Link
					href="/firm-registration"
					className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
				>
					Register a New Firm
				</Link>
			)}
		</div>
	);
};

export default AgentDashboard;
