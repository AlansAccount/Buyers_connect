import { UserContext } from "@/context/UserContext";
import Link from "next/link";
import StatsCard from "@/components/StatsCard";

import { useContext, useEffect, useState } from "react";

interface AdminStats {
	total_agents: number;
	total_buyers: number;
	total_firms: number;
	total_listings: number;
}

const AdminDashboard: React.FC<AdminStats> = ({
	total_agents,
	total_buyers,
	total_firms,
	total_listings,
}) => {
	const { user } = useContext(UserContext);
	const [stats, setStats] = useState<AdminStats | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			const res = await fetch("http://localhost:5000/api/admin/stats", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (res.ok) {
				const data = await res.json();
				setStats(data);
			} else {
				console.error("Failed to load stats.");
			}
		};
		fetchStats();
	}, []);

	if (user?.role !== "admin") {
		return <p>Unauthorised</p>; // Or redirect
	}

	return (
		<div className="max-w-5xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-8">🛠️ Admin Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Link href="/admin/verify-agents">
					<div className="bg-white shadow p-6 rounded hover:bg-blue-50 transition">
						<h2 className="text-xl font-semibold text-black">
							📋 Pending Agents
						</h2>
						<p className="text-gray-600">Verify or reject agent applications</p>
					</div>
				</Link>

				<Link href="/admin/firms">
					<div className="bg-white shadow p-6 rounded hover:bg-blue-50 transition">
						<h2 className="text-xl font-semibold text-black">
							🏢 Registered Firms
						</h2>
						<p className="text-gray-600">View all companies in the registry</p>
					</div>
				</Link>
				<Link href="/admin/agents">
					<div className="bg-white shadow p-6 rounded hover:bg-blue-50 transition">
						<h2 className="text-xl font-semibold text-black">
							📋 Registered Agents
						</h2>
						<p className="text-gray-600">View all signed-up agents.</p>
					</div>
				</Link>
				<Link href="/admin/buyers">
					<div className="bg-white shadow p-6 rounded hover:bg-blue-50 transition">
						<h2 className="text-xl font-semibold text-black">
							🧍 Registered Buyers
						</h2>
						<p className="text-gray-600">View all signed-up property buyers</p>
					</div>
				</Link>
			</div>
			<br></br>
			{stats && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<StatsCard label="Total Agents" value={stats.total_agents} />
					<StatsCard label="Total Buyers" value={stats.total_buyers} />
					<StatsCard label="Total Firms" value={stats.total_firms} />
					<StatsCard label="Total Listings" value={stats.total_listings} />
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
