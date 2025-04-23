import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ExpandableRow from "@/components/AdminExpandableRow";
import Link from "next/link";

interface Buyer {
	id: number;
	name: string;
	email: string;
	created_at: string;
}

const AdminBuyersPage: React.FC = () => {
	const [buyers, setBuyers] = useState<Buyer[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const router = useRouter();

	const normalizedSearch = search.toLowerCase().trim();
	const matches = (str: string) => str.toLowerCase().includes(normalizedSearch);

	useEffect(() => {
		const fetchBuyers = async () => {
			try {
				const res = await fetch("http://localhost:5000/api/admin/buyers", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				});

				if (!res.ok) {
					throw new Error("Failed to fetch buyers.");
				}

				const data = await res.json();
				setBuyers(data);
			} catch (err) {
				console.error(err);
				router.push("/login"); // fallback
			} finally {
				setLoading(false);
			}
		};
		fetchBuyers();
	}, []);

	return (
		<div className="max-w-5xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6 ">🧍 All Registered Buyers</h1>
			<input
				type="type"
				placeholder="Search buyers by name or email ... "
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="border border-gray-300 rounded px-4 py-2 w-full max-w-md mb-4"
			/>

			{loading ? (
				<p>Loading...</p>
			) : buyers.length === 0 ? (
				<p className="text-gray-500">No buyers found.</p>
			) : (
				<table className="w-full border text-sm">
					<thead className="bg-gray-100 text-black">
						<tr>
							<th className="p-2 text-left">Name</th>
							<th className="p-2 text-left">Email</th>
							<th className="p-2 text-left">Registered At</th>
						</tr>
					</thead>
					<tbody>
						{buyers
							.filter((buyer) => {
								const term = search.toLowerCase();
								return (
									buyer.name.toLowerCase().includes(term) ||
									buyer.email.toLowerCase().includes(term)
								);
							})
							.map((buyer) => (
								<ExpandableRow
									key={buyer.id}
									titleRow={
										<>
											<td className="p-2">{buyer.name}</td>
											<td className="p-2">{buyer.email}</td>
											<td className="p-2">
												{new Date(buyer.created_at).toLocaleString()}
											</td>
										</>
									}
								>
									<p>
										<strong>Stats:</strong> Leads: 0 (TBD), Relationships: 0
										(TBD)
									</p>
									<Link
										href={`/admin/buyers/${buyer.id}/profile`}
										className="text-blue-600 underline"
									>
										View Full Profile
									</Link>
								</ExpandableRow>
							))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default AdminBuyersPage;
