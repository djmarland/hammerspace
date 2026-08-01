import {getPublishedPostsPage} from "@/actions/posts";

const PAGE_SIZE = 20;

function escapeXml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function getBaseUrl() {
	return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
		/\/+$/,
		"",
	);
}

function toCdata(value: string) {
	return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function markdownToHtml(markdown: string) {
	const lines = markdown.split("\n");
	const htmlLines: string[] = [];
	let inList = false;

	const closeList = () => {
		if (inList) {
			htmlLines.push("</ul>");
			inList = false;
		}
	};

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) {
			closeList();
			continue;
		}

		if (trimmed.startsWith("### ")) {
			closeList();
			htmlLines.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
			continue;
		}

		if (trimmed.startsWith("## ")) {
			closeList();
			htmlLines.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
			continue;
		}

		if (trimmed.startsWith("# ")) {
			closeList();
			htmlLines.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
			continue;
		}

		if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
			if (!inList) {
				htmlLines.push("<ul>");
				inList = true;
			}
			htmlLines.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
			continue;
		}

		closeList();
		htmlLines.push(`<p>${escapeHtml(trimmed)}</p>`);
	}

	closeList();
	return htmlLines.join("\n");
}

export const revalidate = 60;

export async function GET(request: Request) {
	const url = new URL(request.url);
	const pageParam = url.searchParams.get("page") || "1";
	const page = Number.parseInt(pageParam, 10);

	if (!Number.isInteger(page) || page < 1) {
		return new Response("Invalid page parameter. Use /feed.xml or ?page=2+.", {
			status: 400,
			headers: { "content-type": "text/plain; charset=utf-8" },
		});
	}

	const { posts, totalCount, totalPages } = await getPublishedPostsPage({
		page,
		pageSize: PAGE_SIZE,
	});

	if (page > totalPages || (totalCount === 0 && page > 1)) {
		return new Response("Feed page not found.", {
			status: 404,
			headers: { "content-type": "text/plain; charset=utf-8" },
		});
	}

	const baseUrl = getBaseUrl();
	const feedPath = "/feed.xml";
	const getPageUrl = (pageNumber: number) =>
		pageNumber <= 1
			? `${baseUrl}${feedPath}`
			: `${baseUrl}${feedPath}?page=${pageNumber}`;
	const selfUrl = getPageUrl(page);
	const prevUrl = page > 1 ? getPageUrl(page - 1) : null;
	const nextUrl = page < totalPages ? getPageUrl(page + 1) : null;
	const lastBuildDate =
		posts[0]?.updatedAt?.toUTCString() ?? new Date().toUTCString();

	const itemsXml = posts
		.map((post) => {
			const postUrl = `${baseUrl}/blog/${post.slug}`;
			const excerpt = post.excerpt ?? "";
			const htmlContent = markdownToHtml(post.content);

			return `<item>
<title>${escapeXml(post.title)}</title>
<link>${escapeXml(postUrl)}</link>
<guid isPermaLink="true">${escapeXml(postUrl)}</guid>
<author>${escapeXml(post.author.name || "Unknown")}</author>
<pubDate>${post.createdAt.toUTCString()}</pubDate>
<description>${escapeXml(excerpt)}</description>
<content:encoded><![CDATA[${toCdata(htmlContent)}]]></content:encoded>
</item>`;
		})
		.join("\n");

	const atomLinks = [
		`<atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />`,
		prevUrl
			? `<atom:link href="${escapeXml(prevUrl)}" rel="previous" type="application/rss+xml" />`
			: "",
		nextUrl
			? `<atom:link href="${escapeXml(nextUrl)}" rel="next" type="application/rss+xml" />`
			: "",
	]
		.filter(Boolean)
		.join("\n");

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>Hammerspace</title>
<link>${escapeXml(baseUrl)}</link>
<description>A blog about Web Development, and any other musings</description>
<language>en-gb</language>
<lastBuildDate>${lastBuildDate}</lastBuildDate>
${atomLinks}
${itemsXml}
</channel>
</rss>`;

	return new Response(rss, {
		headers: {
			"content-type": "application/rss+xml; charset=utf-8",
		},
	});
}
