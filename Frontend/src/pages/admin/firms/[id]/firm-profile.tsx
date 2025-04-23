import { useRouter } from "next/router";
import { useState, useEffect } from "react";

interface Agent {
	agent_id: number;
	agent_name: string;
	agent_email: string;
	license_number: string;
	specialties: string[];
	created_at: string;
}

interface Firm {
	id: number;
	name: string;
	registration_number: string;
	country: string;
	city: string;
	street_address: string;
	post_code: string;
	created_at: string;
}

const FirmProfilePage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;

	const [firm, setFirm] = useState<Firm | null>(null);
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!id) return;

		const fetchFirm = async () => {
			try {
				const res = await fetch(`http://localhost:5000/api/admin/firms/${id}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("toke")}`,
					},
				});
				if (!res.ok) throw new Error("Failted to fetch firm details.");

				const data = await res.json();
				setFirm(data.firm);
				setAgents(data.agents);
			} catch (err) {
				setError("Undable to load firm profile.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchFirm();
	}, [id]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p className="text-red-500">{error}</p>;
	if (!firm) return <p>Firm not found.</p>;

	return (
		<div className="max-w-5xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-4">{firm.name}</h1>
			<p className="text-gray-700 mb-2">
				<strong>Registration #:</strong> {firm.registration_number}
			</p>
			<p className="text-gray-700 mb-2">
				<strong>Location:</strong> {firm.street_address}, {firm.city},{" "}
				{firm.country}, {firm.post_code}
			</p>
			<p className="text-gray-700 mb-4">
				<strong>Joined:</strong>{" "}
				{new Date(firm.created_at).toLocaleDateString()}
			</p>

			<h2 className="text-2xl font-semibold mt-8 mb-4">
				🧑‍💼 Agents in this Firm
			</h2>
			{agents.length === 0 ? (
				<p className="text-gray-500">No verified agents found for this firm.</p>
			) : (
				<ul className="space-y-3">
					{agents.map((a) => (
						<li key={a.agent_id} className="border p-4 rounded bg-white shadow">
							<p className="font-semibold">{a.agent_name}</p>
							<p className="text-sm text-gray-600">{a.agent_email}</p>
							<p className="text-sm text-gray-600">
								<strong>Specialties:</strong> {a.specialties.join(", ")}
							</p>
							<p className="text-sm text-gray-600">
								<strong>License #:</strong> {a.license_number}
							</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default FirmProfilePage;
