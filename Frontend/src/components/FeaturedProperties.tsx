import { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";

// Swiper Effect Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import SwiperCore from "swiper";

SwiperCore.use([Autoplay]);

interface PropertyProps {
	id: number;
	title: string;
	location: string;
	price: number;
	property_main_type: string;
	property_sub_type: string;
	agent_name: string;
	agent_user_id: number;
}

const FeaturedProperties: React.FC = () => {
	const [properties, setProperties] = useState<PropertyProps[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProperties = async () => {
			try {
				const res = await fetch("http://localhost:5000/api/properties");
				const data = await res.json();

				if (!res.ok) {
					console.error("Server responded with error:", data);
					throw new Error(data.message || "Failed to fetch properties");
				}

				setProperties(data);
			} catch (err) {
				console.error("Failed to fetch properties:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProperties();
	}, []);

	return (
		<section className="w-full bg-gray-200 py-24 px-40">
			<h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12 tracking-wide">
				Featured Properties.
			</h2>

			<Swiper
				modules={[Autoplay]}
				spaceBetween={30}
				slidesPerView={2}
				autoplay={{ delay: 10000}}
				loop={properties.length >= 2}
				breakpoints={{
					0: { slidesPerView: 1 },
					768: { slidesPerView: 2 },
					1024: { slidesPerView: 3 },
				}}
			>
				{properties.map((property) => (
					<SwiperSlide key={property.id}>
						<PropertyCard
							id={property.id}
							title={property.title}
							location={property.location}
							price={property.price}
							mainType={property.property_main_type}
							subType={property.property_sub_type}
							agentName={property.agent_name}
							agentId={property.agent_user_id}
						/>
					</SwiperSlide>
				))}
			</Swiper>
		</section>
	);
};

export default FeaturedProperties;
