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

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const now = Temporal.Now.instant().toZonedDateTimeISO("UTC");
	const dayOfYear = now.dayOfYear;
	const dynamicHue = getDeterministicHue(dayOfYear, now.year);

	return (
		<html
			lang="en"
			style={
				{
					"--piko-palette-dynamic-hue": dynamicHue,
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
