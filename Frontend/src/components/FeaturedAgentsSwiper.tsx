import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import SwiperCore from "swiper";
import Link from "next/link";

import { useEffect, useState } from "react";

SwiperCore.use([Autoplay]);

interface Agent {
	agent_id: number;
	user_id: number;
	name: string;
	email: string;
	profile_image: string | null;
}

const FeaturedAgentsSwiper: React.FC = () => {
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAgents = async () => {
			try {
				const res = await fetch("http://localhost:5000/api/users/featured");

				const data = await res.json();
				console.log("🧪 Received agent data:", data);

				setAgents(data);
			} catch (err) {
				console.error("Failed to fetch featured agents:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchAgents();
	}, []);

	if (loading) {
		return <p className="text-center text-gray-500">Loading Agents...</p>;
	}

	if (agents.length === 0) {
		return (
			<p className="text-center text-gray-500">No featured agents availible.</p>
		);
	}

	return (
		<section className="w-full bg-gray-100 py-20 px-10">
			<h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
				Featured Agents.
			</h2>
			<Swiper
				modules={[Autoplay]}
				spaceBetween={20}
				slidesPerView={3}
				autoplay={{ delay: 5000 }}
				loop={agents.length >= 7}
				breakpoints={{
					0: { slidesPerView: 1 },
					768: { slidesPerView: 2 },
					1024: { slidesPerView: 3 },
				}}
			>
				{agents.map((agent) => (
					<SwiperSlide key={agent.agent_id}>
						<div className="bg-white shadow-lg p-6 rounded-lg text-center">
							<img
								src={agent.profile_image || "/default-agent.jpg"}
								alt={agent.name}
								className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
							/>
							<h3 className="text-xl font-semibold">{agent.name}</h3>
							<p className="text-gray-500 text-sm">{agent.email}</p>
							<Link href={`/agents/${agent.agent_id}`}>
								<button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
									View Profile
								</button>
							</Link>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</section>
	);
};

export default FeaturedAgentsSwiper;
