export function nowDate() {
	return new Date();
}

function parseDateTimeLocal(value: string) {
	if (!value) {
		return null;
	}

	const match = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u.exec(value);
	if (!match) {
		return null;
	}

	const [datePart, timePart] = value.split("T");
	const [year, month, day] = datePart.split("-").map(Number);
	const [hours, minutes] = timePart.split(":").map(Number);

	if ([year, month, day, hours, minutes].some((part) => Number.isNaN(part))) {
		return null;
	}

	return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

export function isValidDateTimeLocal(value: string) {
	return parseDateTimeLocal(value) !== null;
}

export function parseDateTimeLocalAsDate(value: string) {
	return parseDateTimeLocal(value);
}

export function formatDateTimeLocalValue(date: Date | null | undefined) {
	if (!date) {
		return "";
	}

	const parts = new Intl.DateTimeFormat("sv-SE", {
		timeZone: "UTC",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).formatToParts(new Date(date));

	const values = Object.fromEntries(
		parts
			.filter((part) => part.type !== "literal")
			.map((part) => [part.type, part.value]),
	);
	return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

/**
 * Formats a date as a "-mm-yyyy" suffix (UTC-based) to append to a post's
 * slug the first time it is published. Shared between the server (when
 * actually publishing) and the client (to preview the resulting slug).
 */
export function formatSlugDateSuffix(date: Date) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC",
		year: "numeric",
		month: "2-digit",
	}).formatToParts(date);
	const values = Object.fromEntries(
		parts
			.filter((part) => part.type !== "literal")
			.map((part) => [part.type, part.value]),
	);
	return `-${values.month}-${values.year}`;
}
