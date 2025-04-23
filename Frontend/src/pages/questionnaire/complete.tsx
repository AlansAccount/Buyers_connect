import Link from "next/link";

const CompleteQuestionnaire: React.FC = () => {
	return (
		<>
			<h1 className="text-2xl font-bold text-center text-green-700 mb-4">
				✅ Questionnaire Submitted Successfully!
			</h1>
			<p className="text-center text-gray-700 max-w-xl mx-auto">
				Thank you for sharing your preferences. Your answers will help us match
				you with the most suitable buyer's agent for your goals.
			</p>
			<p className="text-center text-gray-600 mt-4">
				Our team will review your profile shortly. If you've enabled messaging,
				expect to hear from a vetted agent soon.
			</p>
			<Link href="/dashboard">
				<button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">
					Go to Dashboard
				</button>
			</Link>
		</>
	);
};

export default CompleteQuestionnaire;
