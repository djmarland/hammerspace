import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { site } from "@/lib/site";
import "@/styles/globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: "Hammerspace",
	openGraph: { siteName: site.name },
	twitter: { card: "summary" },
	icons: {
		// favicon.ico must declare a fixed size, or Chrome prefers it over the SVG.
		icon: [
			{ url: "/favicon.ico", sizes: "32x32" },
			{ url: "/icon.svg", type: "image/svg+xml" },
		],
		apple: "/apple-touch-icon.png",
	},
	alternates: {
		types: {
			"application/rss+xml": [{ url: "/feed.xml", title: "RSS" }],
		},
	},
	other: {
		"text-scale": "scale",
	},
};

export const viewport: Viewport = {
	width: "device-width",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/microlighter@2.1.0/dist/themes/github.css"
				/>
				{/* eslint-disable-next-line @next/next/no-css-tags -- /hue.css is a dynamic route handler with its own daily cache, so it can't be imported */}
				<link rel="stylesheet" href="/hue.css" />
			</head>
			<body data-syntax-theme="github">
				<Script
					type="module"
					src="https://cdn.jsdelivr.net/npm/microlighter@2.1.0/dist/microlighter.min.js"
					strategy="afterInteractive"
				/>
				{children}
			</body>
		</html>
	);
}
