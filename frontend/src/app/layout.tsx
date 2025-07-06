import type { Metadata } from "next";
import "./reset.css";
import "./global.css";
import { ReactNode } from "react";
import { Masthead } from "@/components/organisms/Masthead/Masthead";

export const metadata: Metadata = {
	title: "Hammerspace",
	description: "Personal Blog of David Marland",
};

// Choose a different theme color for each month.
// light color must contrast with a white background
// dark color must contrast with a black background
const THEME_COLOR = [
	// [light color, dark color]
	["#001f3f", "#f0f8ff"], // January - todo
	["#8b4513", "#ffebcd"], // February - todo
	["#2e8b57", "#fffacd"], // March - todo
	["#4b0082", "#e6e6fa"], // April - todo
	["#556b2f", "#f5f5dc"], // May - todo
	["#800080", "#fff0f5"], // June - todo
	["#cdab23", "#ffd42d"], // July
	["#a52a2a", "#ffe4e1"], // August - todo
	["#808000", "#fafad2"], // September - todo
	["#696969", "#d3d3d3"], // October - todo
	["#b22222", "#ffdead"], // November - todo
	["#177314", "#217e18"], // December
];

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const month = new Date().getMonth();
	// const month = Math.floor(Math.random() * 12);
	// const month = 0;
	return (
		<html lang="en">
			<head>
				<style>
					{`
						:root {
							--theme-color: light-dark(
								${THEME_COLOR[month][0]}, 
								${THEME_COLOR[month][1]}
							);
						}	
					`}
				</style>
			</head>
			<body>
				<Masthead />
				{children}
			</body>
		</html>
	);
}
