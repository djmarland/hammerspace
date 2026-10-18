import { renderMarkdown } from "@/lib/markdown";
import { getPublicSyndicationPosts } from "@/lib/posts";
import type { PublicPostSummary } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";
import { socials } from "@/lib/socials";

function escapeXml(value: string) {
	return value.replace(/[<>&'"]/g, (character) => {
		return (
			{ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[
				character
			] || character
		);
	});
}

function wrapCdata(value: string) {
	return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function renderSocialsHtml() {
	const items = socials
		.map(
			(social) =>
				`<li>${escapeXml(social.name)}: <a href="${escapeXml(social.href)}">${escapeXml(social.handle)}</a></li>`,
		)
		.join("");
	return `<hr><p><strong>Find me in these places:</strong></p><ul>${items}</ul>`;
}

function renderCoverXml(cover: NonNullable<PublicPostSummary["coverAsset"]>) {
	const url = escapeXml(cover.url);
	const type = escapeXml(cover.mimeType);
	return `
	<enclosure url="${url}" length="${cover.size}" type="${type}" />
	<media:content url="${url}" fileSize="${cover.size}" type="${type}" medium="image">${cover.alt ? `<media:description>${escapeXml(cover.alt)}</media:description>` : ""}</media:content>`;
}

function renderCoverHtml(cover: NonNullable<PublicPostSummary["coverAsset"]>) {
	return `<p><img src="${escapeXml(cover.url)}" alt="${escapeXml(cover.alt)}"></p>`;
}

export const revalidate = 600;

export async function GET(request: Request) {
	const url = new URL(request.url);
	const page = url.searchParams.get("page") || undefined;
	const archive = await getPublicSyndicationPosts({ page });
	const currentPageHref =
		archive.page > 1 ? `/feed.xml?page=${archive.page}` : "/feed.xml";
	const socialsHtml = renderSocialsHtml();
	const items = archive.posts
		.map((post) => {
			const postUrl = absoluteUrl(`/posts/${post.slug}`);
			return `<item>
	<title>${escapeXml(post.title)}</title>
	<link>${postUrl}</link>
	<guid isPermaLink="true">${postUrl}</guid>
	<content:encoded>${wrapCdata((post.coverAsset ? renderCoverHtml(post.coverAsset) : "") + renderMarkdown(post.content) + socialsHtml)}</content:encoded>
	<pubDate>${post.publishedAt!.toUTCString()}</pubDate>${post.coverAsset ? renderCoverXml(post.coverAsset) : ""}
</item>`;
		})
		.join("\n");
	const previousPageHref =
		archive.page > 1
			? archive.page === 2
				? "/feed.xml"
				: `/feed.xml?page=${archive.page - 1}`
			: null;
	const nextPageHref =
		archive.page < archive.totalPages
			? `/feed.xml?page=${archive.page + 1}`
			: null;
	const lastBuildDate =
		archive.posts[0]?.publishedAt!.toUTCString() ?? new Date().toUTCString();
	const atomLinks = [
		`<atom:link href="${absoluteUrl(currentPageHref)}" rel="self" type="application/rss+xml" />`,
		previousPageHref
			? `<atom:link href="${absoluteUrl(previousPageHref)}" rel="previous" type="application/rss+xml" />`
			: "",
		nextPageHref
			? `<atom:link href="${absoluteUrl(nextPageHref)}" rel="next" type="application/rss+xml" />`
			: "",
	]
		.filter(Boolean)
		.join("");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/"><channel>
<title>${escapeXml(site.name)}</title><link>${site.url}</link><description>${escapeXml(site.description)}</description><lastBuildDate>${lastBuildDate}</lastBuildDate>${atomLinks}
${items}</channel></rss>`,
		{ headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
	);
}
