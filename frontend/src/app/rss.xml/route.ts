import { getLatestPosts } from "@/services/posts";
import { NextResponse } from "next/server";

const MAX_POSTS = 20;

export async function GET() {
	const posts = await getLatestPosts(MAX_POSTS);
	const publishedPosts = posts.items
		.filter((post) => post.publishedDate)
		.sort(
			(a, b) =>
				(b.publishedDate?.date.getTime() ?? 0) -
				(a.publishedDate?.date.getTime() ?? 0),
		);

	const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hammerspace</title>
    <link>${process.env.NEXT_PUBLIC_SITE_URL}</link>
    <description>Latest blog posts from Hammerspace</description>
    <atom:link href="${process.env.NEXT_PUBLIC_SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${publishedPosts
			.map(
				(post) => `
    <item>
      <title>${post.title}</title>
      <link>${process.env.NEXT_PUBLIC_SITE_URL}${post.url}</link>
      <guid>${process.env.NEXT_PUBLIC_SITE_URL}${post.url}</guid>
      <pubDate>${post.publishedDate?.date.toUTCString()}</pubDate>
    </item>`,
			)
			.join("")}
  </channel>
</rss>`;

	return new NextResponse(rssXml, {
		headers: {
			"Content-Type": "application/xml",
		},
	});
}
