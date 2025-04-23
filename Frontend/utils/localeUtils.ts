export const detectUserLocale = (): string => navigator.language || "en-US";

export const detectUserCurrency = (): string => {
	const region = detectUserLocale().split("-")[1]; // e.g., 'US
	switch (region) {
		case "GB":
			return "GBP";
		case "JP":
			return "JPY";
		case "EU":
			return "EUR";
		case "AU":
			return "AUD";
		case "CA":
			return "CAD";
		case "SG":
			return "SGD";
		case "KR":
			return "KRW";
		case "NZ":
			return "NZD";
		default:
			return "USD";
	}
};
