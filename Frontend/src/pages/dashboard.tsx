import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { UserContext } from "@/context/UserContext";
import BuyerDashboard from "./dashboard/BuyerDashboard";
import AgentDashboard from "./dashboard/AgentDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";

const Dashboard: React.FC = () => {
	const { user, loading } = useContext(UserContext);
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.replace("/login");
		}
	}, [loading, user]);

	if (loading) {
		return <p>Loading...</p>;
	}

	if (!user) {
		return null;
	}

	if (user?.role === "admin") {
		return <AdminDashboard />;
	} else if (user?.role === "agent") {
		return <AgentDashboard />;
	} else if (user?.role === "buyer") {
		return <BuyerDashboard />;
	} else {
		return <p>Unknown Role.</p>;
	}
};

export default Dashboard;
