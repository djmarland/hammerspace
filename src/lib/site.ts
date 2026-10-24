const fallbackSiteUrl = "http://localhost:3000";

export const site = {
	name: "Hammerspace",
	description:
		"A blog about Web Development, Software Engineering, and Technology in general, plus maybe other topics of interest.",
	url: (process.env.PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, ""),
};

export function absoluteUrl(path: string) {
	return new URL(path, site.url).toString();
}
