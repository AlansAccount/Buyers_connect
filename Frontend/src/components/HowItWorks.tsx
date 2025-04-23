const HowItWorks: React.FC = () => {
	return (
		<>
			<section className="w-full bg-gray-50 py-20 px-40">
				<h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
					How It Works
				</h2>

				<div className="grid grid-cols-3 gap-12">
					{/* Step 1 */}
					<div className="bg-white shadow-lg p-8 rounded-lg text-center">
						<h3 className="text-2xl font-semibold text-gray-800">
							1. Search for Agents
						</h3>
						<p className="text-gray-600 mt-3">
							Find professional real estate agents specializing in your area.
						</p>
					</div>

					{/* Step 2 */}
					<div className="bg-white shadow-lg p-8 rounded-lg text-center">
						<h3 className="text-2xl font-semibold text-gray-800">
							2. Compare & Connect
						</h3>
						<p className="text-gray-600 mt-3">
							Compare agent profiles, read reviews, and choose the best match.
						</p>
					</div>

					{/* Step 3 */}
					<div className="bg-white shadow-lg p-8 rounded-lg text-center">
						<h3 className="text-2xl font-semibold text-gray-800">
							3. Start Your Journey
						</h3>
						<p className="text-gray-600 mt-3">
							Work with a top-rated agent to buy or sell your property
							efficiently.
						</p>
					</div>
				</div>
			</section>
		</>
	);
};

export default HowItWorks;
