export const formatNumber = (num: number): string => num.toLocaleString();

export const formatCurrency = (
	amount: number,
	currency: string = "USD",
	locale: string = "en-US"
): string =>
	new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
	}).format(amount);

export const formatDate = (
	date: Date | string,
	locale: string = "en-US"
): string => {
	const d = new Date(date);
	return d.toLocaleDateString(locale);
};
