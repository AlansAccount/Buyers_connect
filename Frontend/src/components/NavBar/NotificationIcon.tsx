import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/context/UserContext";

const NotificationIcon: React.FC = () => {
	const { user } = useContext(UserContext);
	const [hasReminder, setHasReminder] = useState(false);

	useEffect(() => {
		if (!user || user.role !== "buyer") return;

		const getNotification = async () => {
			try {
				const res = await fetch(
					"http://localhost:5000/api/questionnaire/reminder",
					{
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					}
				);
				const data = await res.json();
				if (data.needsReminder) {
					setHasReminder(true);
				}
			} catch (err) {
				console.error("❌ Notification fetch failed:", err);
			}
		};

		getNotification();
	}, [user]);

	return (
		<div className="relative">
			<span role="img" aria-label="Notifications" className="text-xl">
				🔔
			</span>
			{hasReminder && (
				<span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
			)}
		</div>
	);
};

export default NotificationIcon;
