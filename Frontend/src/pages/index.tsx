import FeaturedProperties from "@/components/FeaturedProperties";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import WebSocketTest from "@/components/WebSocketTest";
import FeaturedAgentsSwiper from "@/components/FeaturedAgentsSwiper";
import FindAgents from "@/components/FindAgents";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/context/UserContext";

const Home: React.FC = () => {
	const { user } = useContext(UserContext);
	const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] =
		useState(false);

	useEffect(() => {
		const check = async () => {
			if (user?.role === "buyer") {
				const res = await fetch(
					`http://localhost:5000/api/questionnaire/check`,
					{
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					}
				);
				const data = await res.json();
				setHasCompletedQuestionnaire(data.is_complete); // ✅ fix typo
			}
		};
		check();
	}, [user]);

	return (
		<>
			<FindAgents user={user} hasCompletedQuestionnaire={false} />
			<HowItWorks />
			<FeaturedAgentsSwiper />
			<FeaturedProperties />
			<Testimonials />

			{/* Add WebSocket Test Here */}
			<div className="p-10 flex justify-center">
				<WebSocketTest />
			</div>
		</>
	);
};

export default Home;
