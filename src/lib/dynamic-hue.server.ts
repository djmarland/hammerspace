function getDeterministicHue(dayOfYear: number, year: number): number {
	const dayCount = Temporal.PlainDate.from({
		year,
		month: 1,
		day: 1,
	}).daysInYear;
	const shuffledDays = Array.from(
		{ length: dayCount },
		(_, index) => index + 1,
	);
	let seed = year;

	for (let index = shuffledDays.length - 1; index > 0; index -= 1) {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		const random = seed / 0x100000000;
		const swapIndex = Math.floor(random * (index + 1));

		[shuffledDays[index], shuffledDays[swapIndex]] = [
			shuffledDays[swapIndex],
			shuffledDays[index],
		];
	}

	return shuffledDays[dayOfYear - 1];
}

export function getDailyHue(): number {
	const today = Temporal.Now.plainDateISO();
	return getDeterministicHue(today.dayOfYear, today.year);
}

export function getSecondsUntilNextHue(): number {
	const now = Temporal.Now.zonedDateTimeISO();
	const startOfTomorrow = now
		.toPlainDate()
		.add({ days: 1 })
		.toZonedDateTime(now.timeZoneId);

	return Math.ceil(startOfTomorrow.since(now).total({ unit: "seconds" }));
}
