import type { MetadataRoute } from "next";
import { STATIC_ICON_HUE, paletteHex } from "@/lib/favicon";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Hammerspace",
		short_name: "Hammerspace",
		start_url: "/",
		display: "browser",
		background_color: paletteHex(1, STATIC_ICON_HUE),
		theme_color: paletteHex(7, STATIC_ICON_HUE),
		icons: [
			{ src: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ src: "/icon-512.png", sizes: "512x512", type: "image/png" },
			{
				src: "/icon-maskable-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
