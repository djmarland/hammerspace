const fallbackSiteUrl = "http://localhost:3000";

export const site = {
	name: "Hammerspace",
	description: "A posts about web development and other musings.",
	url: (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, ""),
};

export function absoluteUrl(path: string) {
	return new URL(path, site.url).toString();
}
