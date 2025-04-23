import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ExpandableRow from "@/components/AdminExpandableRow";
import Link from "next/link";

const AdminAgentApprovalPage: React.FC = () => {
	const [agents, setAgents] = useState<any[]>([]);
	const { user } = useContext(UserContext);
	const router = useRouter();

	useEffect(() => {
		if (user && user.role !== "admin") {
			router.push("/login");
		}
	}, [user]);

	// Fetch pending agents on mount.
	useEffect(() => {
		const fetchPending = async () => {
			try {
				const res = await fetch(
					"http://localhost:5000/api/admin/agents/pending",
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);

				if (!res.ok) {
					const error = await res.json();
					console.error("❌ Backend Error:", error.message);
					return;
				}

				const data = await res.json();
				if (!Array.isArray(data)) {
					console.error("❌ Invalid response format:", data);
					return;
				}

				setAgents(data);
			} catch (err) {
				console.error("Error fetching pending agents", err);
			}
		};
		fetchPending();
	}, []);

	// Approve Handler
	const handleVerify = async (id: number) => {
		const res = await fetch(
			`http://localhost:5000/api/admin/agents/${id}/verify`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}
		);

		if (res.ok) {
			toast.success("✅ Agent Verified");
			setAgents((prev) => prev.filter((a) => a.agent_id !== id));
		} else {
			toast.error("❌ Verification failed.");
		}
	};

	// Reject Handler
	const handleReject = async (id: number) => {
		if (!confirm("Are you sure? This will delete the agent.")) return;
		const res = await fetch(
			`http://localhost:5000/api/admin/agents/${id}/reject`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}
		);
		if (res.ok) setAgents(agents.filter((a) => a.agent_id !== id));
	};
	return (
		<div className="max-w-5xl mx-auto py-10 px-6">
			<h1 className="text-3xl font-bold mb-6">
				🕵️ Pending Agent Verifications
			</h1>

			{agents.length === 0 ? (
				<p className="text-gray-500">No pending agents.</p>
			) : (
				<table className="w-full border text-sm">
					<thead className="bg-gray-100">
						<tr>
							<th className="p-2">Agent</th>
							<th className="p-2">License #</th>
							<th className="p-2">Docs</th>
							<th className="p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{agents.map((agent) => (
							<tr key={agent.agent_id} className="border-t">
								<td className="p-2">
									<strong>{agent.agent_name}</strong>
									<br />
									<span className="text-xs text-gray-500">
										{agent.agent_email}
									</span>
								</td>
								<td className="p-2">{agent.license_number}</td>
								<td className="p-2">
									<ul className="list-disc ml-4">
										{agent.license_files?.map((file: string, i: number) => (
											<li key={i}>
												<a
													href={`http://localhost:5000/${file}`}
													target="_blank"
													className="text-blue-600 underline"
												>
													View File {i + 1}
												</a>
											</li>
										))}
									</ul>
								</td>
								<td className="p-2 space-x-2">
									<button
										onClick={() => handleVerify(agent.agent_id)}
										className="bg-green-600 text-white px-3 py-1 rounded text-sm"
									>
										Verify
									</button>
									<button
										onClick={() => handleReject(agent.agent_id)}
										className="bg-red-600 text-white px-3 py-1 rounded text-sm"
									>
										Reject
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default AdminAgentApprovalPage;
