import Link from "next/link";

interface PropertyCardProps {
	id: number;
	title: string;
	location: string;
	price: number;
	mainType: string;
	subType: string;
	agentName: string;
	agentId: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
	id,
	title,
	location,
	price,
	mainType,
	subType,
	agentName,
	agentId,
}) => {
	return (
		<div className="bg-white shadow-lg p-6 rounded-lg test-left">
			<h3 className="text-xl font-bold text-gray-800">{title}</h3>
			<p className="text-sm text-gray-600">
				{mainType} → {subType}
			</p>
			<p className="text-sm text-gray-500 mt-1">{location}</p>
			<p className="text-lg font-semibold text-blue-700 mt-2">
				${price.toLocaleString()}
			</p>
			{/* <p className="text-sm text-gray-700 mt-2">Agent: {agentName}</p> */}
			<Link href={`/agents/${agentId}`}>
				<button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
					View Agent: {agentName}
				</button>
			</Link>
		</div>
	);
};

export default PropertyCard;
