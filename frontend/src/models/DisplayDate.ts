export class DisplayDate {
	static format(date: string | null | undefined, fallback = "-"): string {
		if (!date) return fallback;

		const parsedDate = new Date(date);

		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "short",
			day: "2-digit",
		};
		return parsedDate.toLocaleString("en-GB", options);
	}
}
