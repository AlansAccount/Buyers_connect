import { useEffect, useState } from "react";

interface Agent {
	agent_id: number;
	user_id: number;
	name: string;
	email: string;
	profile_image: string | null;
}

const FeaturedAgents: React.FC = () => {
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAgents = async () => {
			try {
				const res = await fetch("http://local:5000/api/users/featured");

				const data = await res.json();
				setAgents(data);
			} catch (err) {
				console.error("Failed to fetch featured agetns:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchAgents();
	}, []);

	if (loading) return <p>Loading Agents...</p>;

	return (
		<section className="w-full bg-gray-200 py-24 px-40">
			<h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12 tracking-wide">
				Featured Agents
			</h2>
			<div className="grid grid-cols-3 gap-12">
				{agents.map((agent) => (
					<div
						key={agent.agent_id}
						className="bg-white shadow-lg p-8 rounded-lg text-center"
					>
						<img
							src={agent.profile_image || "/default-agent.jpg"}
							alt={agent.name}
							className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
						/>
						<h3 className="text-xl font-semibold">{agent.name}</h3>
						<p className="text-gray-500 text-sm">{agent.email}</p>
						<button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
							View Profile
						</button>
					</div>
				))}
			</div>
		</section>
	);
};

export default FeaturedAgents;
