const testimonials = [
	{
		name: "Johnny Doe",
		review: "The best real estate service I've ever used! Highly recommend!",
		rating: 4,
	},
	{
		name: "Sammy Doe",
		review: "Seamless experience from start to finish. Very professional.",
		rating: 5,
	},
	{
		name: "Timmy Doe",
		review: "Great platform for finding experienced real estate agents.",
		rating: 4,
	},
];
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 !== 0;
	const emptyStars = 5 - Math.ceil(rating);

	return (
		<div className="flex text-yellow-400 text-2xl">
			{/* Full Stars */}
			{[...Array(fullStars)].map((_, i) => (
				<BsStarFill key={i} className="mr-1" />
			))}

			{/* Half Star (if applicable) */}
			{hasHalfStar && <BsStarHalf className="mr-1 text-yellow-300" />}

			{/* Empty Stars */}
			{[...Array(emptyStars)].map((_, i) => (
				<BsStar key={i} className="mr-1 text-gray-300" />
			))}
		</div>
	);
};

const Testimonials: React.FC = () => {
	return (
		<section className="w-full bg-gray-200 py-24 px-40">
			<h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12 tracking-wide">
				Client Testimonials
			</h2>
			<div className="grid grid-cols-3 gap-12">
				{testimonials.map((testimonial, index) => (
					<div
						key={index}
						className="bg-white shadow-lg p-8 rounded-lg text-center"
					>
						<h3 className="text-xl font-semibold text-gray-800 mt-4">
							{testimonial.name}
						</h3>
						<p className="text-gray-600 text-lg italic leading-relaxed">
							{testimonial.review}
						</p>
						<StarRating rating={testimonial.rating} />

						{/* <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={300}
                        height={300}
                    /> */}
						<button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition transform hover:scale-105 duration-200 shadow-lg">
							Read More
						</button>
					</div>
				))}
			</div>
		</section>
	);
};

export default Testimonials;
