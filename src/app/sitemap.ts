import type { MetadataRoute } from "next";
import { getPublicSyndicationPosts, getPublicTagIndex } from "@/actions/posts";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [posts, tags] = await Promise.all([
		getPublicSyndicationPosts(),
		getPublicTagIndex(),
	]);

	return [
		{ url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
		{ url: absoluteUrl("/blog"), changeFrequency: "daily", priority: 0.9 },
		...tags.map((tag) => ({
			url: absoluteUrl(`/tags/${tag.slug}`),
			lastModified: tag.updatedAt,
			changeFrequency: "weekly" as const,
			priority: 0.7,
		})),
		...posts.map((post) => ({
			url: absoluteUrl(`/blog/${post.slug}`),
			lastModified: post.publishedAt,
			changeFrequency: "weekly" as const,
			priority: 0.8,
		})),
	];
}
