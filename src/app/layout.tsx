import type {Metadata} from "next";
import "@/styles/globals.css";
import {Masthead} from "@/components/Organisms/Masthead/Masthead.tsx";
import {Footer} from "@/components/Organisms/Footer/Footer.tsx";

export const metadata: Metadata = {
	title: "Hammerspace",
	description: "A blog about Web Development, and any other musings",
	alternates: {
		types: {
			"application/rss+xml": "/feed.xml",
		},
	},
};

function getDeterministicHue(dayOfYear: number, year: number) {
	const dayCount = Temporal.PlainDate.from({ year, month: 1, day: 1 }).daysInYear;
	const shuffledDays = Array.from({ length: dayCount }, (_, index) => index + 1);
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

function getComplementaryHue(hue: number) {
	return (hue + 180) % 360;
}

function getHolidayHue(month: number, day: number) {
	if (month === 12 && day === 25) {
		// Christmas: classic green and red holiday colours.
		return 146;
	}

	if (month === 10 && day === 31) {
		// Halloween: orange and black for autumn nights.
		return 35;
	}

	if (month === 1 && day === 1) {
		// New Year: gold and silver for celebration.
		return 45;
	}

	if (month === 2 && day === 14) {
		// Valentine's Day: pink and red for romance.
		return 342;
	}

	if (month === 3 && day === 17) {
		// St Patrick's Day: green for Irish tradition.
		return 146;
	}

	return null;
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const now = Temporal.Now.instant().toZonedDateTimeISO("UTC");
	const dayOfYear = now.dayOfYear;
	const dynamicHue = getDeterministicHue(dayOfYear, now.year);
	const holidayHue = getHolidayHue(now.month, now.day);
	const paletteHue = holidayHue ?? dynamicHue;
	const complementaryHue = getComplementaryHue(paletteHue);

	return (
		<html
			lang="en"
			style={
				{
					"--piko-palette-dynamic-primary-hue": paletteHue,
					"--piko-palette-dynamic-secondary-hue": complementaryHue,
				} as React.CSSProperties
			}
		>
			<body>
				<Masthead />
				<main>
					{/* todo- setup a grid with this that can be broken out of */}
					<div className="container">{children}</div>
				</main>
				<Footer />
			</body>
		</html>
	);
}
