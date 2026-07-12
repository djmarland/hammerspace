import type { Metadata } from "next";
import "@/styles/globals.css";
import { Masthead } from "@/components/Organisms/Masthead/Masthead.tsx";
import { Footer } from "@/components/Organisms/Footer/Footer.tsx";

export const metadata: Metadata = {
	title: "Hammerspace",
	description: "A blog about Web Development, and any other musings",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const now = new Date();
	const startOfYear = new Date(now.getFullYear(), 0, 0);
	const dayOfYear = Math.floor(
		(now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
	);

	return (
		<html
			lang="en"
			style={
				{
					"--piko-palette-dynamic-hue": dayOfYear,
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
