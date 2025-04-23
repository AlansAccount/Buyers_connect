import { useEffect, useState } from "react";
import ExpandableRow from "@/components/AdminExpandableRow";

interface Firm {
	id: number;
	name: string;
	city?: string;
	country?: string;
	registration_number: string;
	post_code?: string;
	street_address?: string;
	created_at: string;
	agent_count: number;
}

const AdminFirmsPage: React.FC = () => {
	const [firms, setFirms] = useState<Firm[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	useEffect(() => {
		const fetchFirms = async () => {
			try {
				const res = await fetch("http://localhost:5000/api/admin/firms", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				});

				if (!res.ok) throw new Error("Failed to fetch firms.");
				const data = await res.json();
				setFirms(data);
			} catch (err) {
				console.error("Error fetching firms:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchFirms();
	}, []);

	const filtered = firms.filter((f) => {
		const term = search.toLowerCase();
		return (
			f.name.toLowerCase().includes(term) ||
			f.city?.toLowerCase().includes(term) ||
			f.country?.toLowerCase().includes(term) ||
			f.registration_number.toLowerCase().includes(term)
		);
	});

	return (
		<div className="max-w-6xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">🏢 Registered Firms</h1>

			<input
				type="text"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search by name, location, reg number..."
				className="border px-4 py-2 mb-4 w-full max-w-md rounded"
			/>

			{loading ? (
				<p>Loading...</p>
			) : filtered.length === 0 ? (
				<p className="text-gray-500">No matching firms found.</p>
			) : (
				<table className="w-full border text-sm">
					<thead className="bg-gray-100 text-left text-black">
						<tr>
							<th className="p-2">Name</th>
							<th className="p-2">Location</th>
							<th className="p-2">Reg #</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((firm) => (
							<ExpandableRow
								key={firm.id}
								titleRow={
									<>
										<td className="p-2 ">{firm.name}</td>
										<td className="p-2">
											{[firm.city, firm.country].filter(Boolean).join(", ") ||
												"N/A"}
										</td>
										<td className="p-2">{firm.registration_number}</td>
									</>
								}
							>
								<p>
									<strong>Address:</strong> {firm.street_address}
									{firm.post_code}
								</p>
								<p>
									<strong>Registered:</strong>
									{new Date(firm.created_at).toLocaleDateString()}
								</p>
								<p>
									<strong>Agents:</strong> {firm.agent_count}
								</p>
								{/* Placeholder for profile link */}
							</ExpandableRow>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default AdminFirmsPage;
