import { GetServerSideProps } from "next";
import { useState } from "react";
import Image from "next/image";

interface Agent {
	name: string;
	email: string;
	profile_image: string | null;
}

interface Property {
	id: number;
	title: string;
	price: number;
	location: string;
	mainType: string;
	subType: string;
	image_url: string | null;
}

interface AgentProfilePageProps {
	agent: Agent;
	properties: Property[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params!;

	const res = await fetch(`http://localhost:5000/api/agents/${id}`);
	if (!res.ok) {
		return {
			notFound: true,
		};
	}
	const agentData = await res.json();

	return {
		props: {
			agent: {
				name: agentData.name,
				email: agentData.email,
				profile_image: agentData.profile_image,
			},
			properties: agentData.properties || [],
		},
	};
};

const AgentProfilePage: React.FC<AgentProfilePageProps> = ({
	agent,
	properties,
}) => {
	const [message, setMessage] = useState("");
	const [selectedProperty, setSelectedProperty] = useState<Property | null>(
		null
	);

	const handleSendEnquiry = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch(
				`http://localhost:5000/api/properties/${selectedProperty?.id}/enquiry`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({ message }),
				}
			);
			if (res.ok) {
				alert("Enquiry sent!");
				setMessage("");
			} else {
				alert("Failed to send. Try again.");
			}
		} catch (err) {
			console.error(err);
			alert("Error sending enquiry.");
		}
	};

	// ✅ RETURN JSX HERE — OUTSIDE the handler!
	return (
		<div className="p-10">
			<h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
			<p className="text-gray-500 mb-4">{agent.email}</p>

			{agent.profile_image && (
				<Image
					src={agent.profile_image}
					alt={`${agent.name}'s Profile`}
					width={128}
					height={128}
					className="object-cover rounded-full mb-6"
				/>
			)}

			{selectedProperty && (
				<div className="text-2xl font-semibold mb-2">
					<h2 className="text-2xl font-semibold mt-10 mb-4">
						Contact About:
						<span className="text-blue-600"> {selectedProperty.title}</span>
					</h2>
					<form className="space-y-4 max-w-md" onSubmit={handleSendEnquiry}>
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Write your message here..."
							className="w-full p-3 border border-gray-300 rounded text-black"
							rows={5}
							required
						/>
						<button
							type="submit"
							className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
						>
							Send Enquiry
						</button>
					</form>
				</div>
			)}

			<h2 className="text-2xl font-semibold mb-4 mt-10">Listed Properties</h2>
			<div className="grid grid-cols-2 gap-6">
				{properties.map((property) => (
					<div key={property.id} className="p-4 border rounded-lg shadow">
						{property.image_url && (
							<img
								src={property.image_url}
								alt={property.title}
								className="w-full h-48 object-cover rounder mb-3"
							/>
						)}
						<h3 className="text-lg font-bold">{property.title}</h3>
						<p className="text-sm text-gray-600">{property.location}</p>
						<p className="text-sm text-gray-500">
							{property.mainType} → {property.subType}
						</p>
						<p className="text-md font-semibold mt-2">
							${property.price.toLocaleString()}
						</p>
						<button
							className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
							onClick={() => setSelectedProperty(property)}
						>
							Contact Agent.
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default AgentProfilePage;
