export class DisplayDate {
	date: Date;

	constructor(date: Date) {
		this.date = date;
	}

	toString(): string {
		return DisplayDate.format(this.date);
	}

	static format(date: Date): string {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "short",
			day: "2-digit",
		};
		return date.toLocaleString("en-GB", options);
	}

	static fromISO(isoString: string): DisplayDate {
		const date = new Date(isoString);
		if (isNaN(date.getTime())) {
			throw new Error("Invalid ISO 8601 date string");
		}
		return new DisplayDate(date);
	}
}
