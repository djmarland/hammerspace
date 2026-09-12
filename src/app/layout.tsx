import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
	return (
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/microlighter@2.1.0/dist/themes/github.css"
				/>
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
