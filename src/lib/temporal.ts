import { Temporal } from "@js-temporal/polyfill";

export const CMS_TIME_ZONE = "UTC";

function parseDateTimeLocal(value: string) {
	if (!value) {
		return null;
	}

	try {
		return Temporal.PlainDateTime.from(value);
	} catch {
		return null;
	}
}

export function isValidDateTimeLocal(value: string) {
	return parseDateTimeLocal(value) !== null;
}

export function parseDateTimeLocalAsDate(value: string) {
	const plainDateTime = parseDateTimeLocal(value);
	if (!plainDateTime) {
		return null;
	}

	const zonedDateTime = plainDateTime.toZonedDateTime(CMS_TIME_ZONE);
	return new Date(zonedDateTime.epochMilliseconds);
}

export function formatDateTimeLocalValue(date: Date | null | undefined) {
	if (!date) {
		return "";
	}

	return Temporal.Instant.from(date.toISOString())
		.toZonedDateTimeISO(CMS_TIME_ZONE)
		.toPlainDateTime()
		.toString({ smallestUnit: "minute" });
}
