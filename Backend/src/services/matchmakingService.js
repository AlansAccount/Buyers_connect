// src/services/matchmakingService.js

import { criteriaWeights } from "../config/matchConfig.js";

// haversine formula to compute km
const calcDistanceKm = (lat1, lon1, lat2, lon2) => {
	const toRad = (d) => (d * Math.PI) / 180;
	const R = 6371;
	const dLat = toRad(lat2 - lat1),
		dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const scoreAgent = (buyer, agent) => {
	const w = criteriaWeights;
	let score = 0;

	// 1) Proximity
	const dist = calcDistanceKm(
		buyer.latitude,
		buyer.longitude,
		agent.latitude,
		agent.longitude
	);
	if (dist <= agent.max_service_radius) {
		score += (1 - dist / agent.max_service_radius) * w.proximity;
	}

	// 2) Specialty
	if (agent.specialties.includes(buyer.property_type)) {
		score += w.specialty;
	}

	// 3) Budget
	if (buyer.budget >= agent.min_budget && buyer.budget <= agent.max_budget) {
		score += w.budgetFit;
	}

	// 4) Investment goal
	if (buyer.investment_goal === agent.investment_expertise) {
		score += w.investmentGoal;
	}

	// 5) Language
	if (agent.languages_spoken.includes(buyer.preferred_language)) {
		score += w.language;
	}

	// 6) Experience (cap at 10 yrs)
	const years = Math.min(agent.experience_years, 10);
	score += (years / 10) * w.experience;

	return score;
};

export default scoreAgent;
