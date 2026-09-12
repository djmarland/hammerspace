import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { getDailyHue } from "@/lib/dynamic-hue.server";
import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Hammerspace",
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
	const dynamicHue = getDailyHue();

	return (
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/microlighter@2.1.0/dist/themes/github.css"
				/>
				{/* Inline to set the custom property before first paint, avoiding a
				    flash of the fallback hue defined in globals.css. */}
				<style>{`:root { --piko-palette-dynamic-hue: ${dynamicHue}; }`}</style>
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
