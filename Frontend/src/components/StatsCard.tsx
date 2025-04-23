import Link from "next/link";

interface StatsCardProps {
	label: string;
	value: string | number;
	icon?: React.ReactNode;
	link?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, link }) => {
	return (
		<div className="bg-white shadow-lg rounded-2xl p-5 w-full sm:w-64">
			<div className="flex items-center justify-between">
				<h3 className="text-gray-500 text-sm font-medium">{label}</h3>
				{icon && <div className="text-2xl text-blue-600">{icon}</div>}
			</div>
			<div className="mt-2 text-3xl font-bold text-black">{value}</div>
			{link && (
				<Link
					href={link}
					className="text-sm text-blue-500 hover:underline mt-1 inline-block"
				>
					View more →
				</Link>
			)}
		</div>
	);
};

export default StatsCard;
