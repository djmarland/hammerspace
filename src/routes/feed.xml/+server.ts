import {getPublicSyndicationPosts} from '@/lib/posts';
import {absoluteUrl, site} from '@/lib/site';

function escapeXml(value: string) {
	return value.replace(/[<>&'"]/g, (character) => {
		return { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[
			character
		] || character;
	});
}

export const GET: () => Promise<Response> = async () => {
	const posts = await getPublicSyndicationPosts();
	const items = posts
		.map(
			(post) => `<item>
	<title>${escapeXml(post.title)}</title>
	<link>${absoluteUrl(`/blog/${post.slug}`)}</link>
	<guid isPermaLink="true">${absoluteUrl(`/blog/${post.slug}`)}</guid>
	<description>${escapeXml(post.excerpt || '')}</description>
	<pubDate>${post.publishedAt.toUTCString()}</pubDate>
</item>`
		)
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
<title>${escapeXml(site.name)}</title><link>${site.url}</link><description>${escapeXml(site.description)}</description>
${items}</channel></rss>`,
		{ headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } }
	);
};
