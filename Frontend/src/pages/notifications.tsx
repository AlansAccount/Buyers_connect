import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/router";
const audio =
	typeof Audio !== "undefined" ? new Audio("/sounds/notification.mp3") : null;

const Notifications: React.FC = () => {
	const { user } = useContext(UserContext);
	const [reminder, setReminder] = useState<null | {
		type: string;
		message: string;
		link: string;
	}>(null);
	const [recentForm, setRecentForm] = useState<any | null>(null);
	const [showToast, setShowToast] = useState(false);
	const [lastSeenReminder, setLastSeenReminder] = useState<string | null>(null);

	const router = useRouter();

	useEffect(() => {
		const fetchReminder = async () => {
			if (!user || user.role !== "buyer") return;

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
				if (data.needsReminder && data.reminder) {
					if (data.reminder.message !== lastSeenReminder) {
						setReminder(data.reminder);
						setShowToast(true);
						audio?.play();
						setLastSeenReminder(data.reminder.message);
						setTimeout(() => setShowToast(false), 5000);
					}
				}
			} catch (err) {
				console.error("Failed to fetch notification data", err);
			}
		};
		fetchReminder();
	}, []);

	useEffect(() => {
		const fetchForm = async () => {
			try {
				const res = await fetch(
					"http://localhost:5000/api/questionnaire/submissions",
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
				const data = await res.json();
				const recent = data.find((form: any) => {
					const submitted = new Date(form.submitted_at);
					const now = new Date();
					const diff = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
					return diff < 24;
				});
				if (recent) setRecentForm(recent);
			} catch (err) {
				console.error("Error fetching submissions", err);
			}
		};

		if (user?.role === "buyer") fetchForm();
	}, [user]);

	return (
		<div className="max-w-3xl mx-auto py-10 px-4">
			{showToast && reminder && (
				<div className="fixed top-5 right-5 z-50 bg-yellow-400 text-black px-4 py-3 rounded shadow-lg animate-fade-in-out">
					<strong className="block font-semibold">{reminder.message}</strong>
				</div>
			)}
			<h1 className="text-2xl font-bold mb-4">Notifications</h1>
			{reminder ? (
				<div className="bg-yellow-100 border-1-4 border-yellow-500 p-4 rounded ">
					<p>{reminder?.message ?? "Reminder available"}</p>
					<button
						className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
						onClick={() => router.push(reminder?.link || "/")}
					>
						Resume Questionnaire
					</button>
				</div>
			) : (
				<p>No notifications right now.</p>
			)}
			{recentForm && (
				<div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded mt-6">
					<p>
						✅ You submitted a form recently (#{recentForm.id}) at
						<strong>
							{new Date(recentForm.submitted_at).toLocaleString()}
						</strong>
					</p>
					<button
						onClick={() => (window.location.href = "/forms")}
						className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
					>
						View My Submission
					</button>
				</div>
			)}
		</div>
	);
};

export default Notifications;
