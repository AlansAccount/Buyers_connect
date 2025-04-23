import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ExpandableRow from "@/components/AdminExpandableRow";
import Link from "next/link";

interface Agent {
	agent_id: number;
	agent_name: string;
	agent_email: string;
	license_number: string;
	created_at: string;
	specialties: string[];
	city?: string;
	country?: string;
	firm_name?: string;
}

const AdminAgentPage: React.FC = () => {
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [error, setError] = useState<string | null>(null);

	const router = useRouter();

	useEffect(() => {
		const fetchAgents = async () => {
			try {
				const res = await fetch("http://localhost:5000/api/admin/agents", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				});
				if (!res.ok) throw new Error("Failed to fetch agents.");
				const data = await res.json();
				setAgents(data);
			} catch (err) {
				console.error("Failed to fetch agents:", err);
				setError("Could not load agent data.");
			} finally {
				setLoading(false);
			}
		};
		fetchAgents();
	}, []);

	return (
		<div className="max-w-6xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">🧑‍💼 Verified Agents</h1>
			{error && (
				<p className="text-red-600 bg-red-100 p-2 rounded mb-4">{error}</p>
			)}

			<input
				type="text"
				placeholder="Search by name, email, specialty, or location..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="border border-gray-300 rounded px-4 py-2 w-full max-w-md mb-4"
			/>

			{loading ? (
				<p>Loading...</p>
			) : agents.length === 0 ? (
				<p className="text-gray-500">No verified agents.</p>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm border">
						<thead className="bg-gray-100">
							<tr>
								<th className="p-2 text-left">Name</th>
								<th className="p-2 text-left">Email</th>
								<th className="p-2 text-left">License #</th>
							</tr>
						</thead>
						<tbody>
							{agents
								.filter((a) => {
									const q = search.toLowerCase();
									return (
										a.agent_name.toLowerCase().includes(q) ||
										a.agent_email.toLowerCase().includes(q) ||
										a.specialties.join(", ").toLowerCase().includes(q) ||
										a.city?.toLowerCase().includes(q) ||
										a.country?.toLowerCase().includes(q)
									);
								})
								.map((a) => (
									<ExpandableRow
										key={a.agent_id}
										titleRow={
											<>
												<td className="p-2">{a.agent_name}</td>
												<td className="p-2">{a.agent_email}</td>
												<td className="p-2">{a.license_number}</td>
											</>
										}
									>
										<p>
											<strong>Specialties:</strong>{" "}
											{a.specialties.join(", ") || "N/A"}
										</p>
										<p>
											<strong>Location:</strong>{" "}
											{[a.city, a.country].filter(Boolean).join(", ") || "N/A"}
										</p>
										<p>
											<strong>Firm:</strong> {a.firm_name || "N/A"}
										</p>
										<Link
											href={`/admin/agents/${a.agent_id}/profile`}
											className="text-blue-600 underline"
										>
											View Profile
										</Link>
									</ExpandableRow>
								))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default AdminAgentPage;
