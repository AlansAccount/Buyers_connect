import { useRouter } from "next/router";
import { User } from "@/types";

interface FindAgentsProps {
	user: any;
	hasCompletedQuestionnaire: boolean;
}

const FindAgents: React.FC<FindAgentsProps> = ({
	user,
	hasCompletedQuestionnaire,
}) => {
	const router = useRouter();

	const handleFindAgent = (e: React.MouseEvent) => {
		e.preventDefault();

		if (!user) {
			router.push("/login");
			return;
		}
		if (user.role === "buyer" && !hasCompletedQuestionnaire) {
			router.push("/questionnaire");
			return;
		}
		router.push("/agents");
	};

	return (
		<section
			className="flex flex-col items-start justify-center min-h-[50vh] bg-gray-200 text-center p-10 pl-40"
			style={{
				backgroundImage: "url('/REStockImg.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			{/* Content */}
			<h1 className="text-5xl font-bold text-white drop-shadow-md">
				Find the Best Buyers' Agents
			</h1>
			<p className="text-lg text-gray-300 mt-3 max-w-2xl drop-shadow-md">
				Get expert real estate guidance to make the best home-buying decision.
			</p>

			{/* Search Bar */}
			<div className="mt-6 flex space-x-3">
				<form>
					<input
						type="text"
						placeholder="Enter a location, agent, or expertise..."
						className="p-3 w-80 md:w-auto border border-gray-400 rounded-lg"
					/>
					<button
						className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-black transition"
						onClick={handleFindAgent}
					>
						Find Agents
					</button>
				</form>
			</div>
		</section>
	);
};

export default FindAgents;
