export interface BuyerQuestionnaire {
	user_id: number;
	property_type: string;
	budget: number;
	timeframe: number; // e.g. months until purchase
	investment_goal: "capital" | "rental" | string;
	preferred_language: string;
	latitude: number; // you’ll need to geocode buyer’s desired area
	longitude: number;
	// …other questionnaire fields
}

export interface AgentProfile {
	id: number;
	user_id: number;
	specialties: string[]; // e.g. ["residential","2-bedroom"]
	languages_spoken: string[]; // e.g. ["en","zh"]
	experience_years: number;
	min_budget?: number;
	max_budget?: number;
	license_verified: boolean;
	latitude: number; // add these columns to agents table
	longitude: number;
	max_service_radius: number; // in kilometres
}
