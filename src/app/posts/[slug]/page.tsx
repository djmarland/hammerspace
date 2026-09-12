import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import PostCard from "@/components/Blog/PostCard";
import PostBody from "@/components/Blog/PostBody";
import SidePageHeader from "@/components/Blog/SidePageHeader";
import ReadingTime from "@/components/Blog/ReadingTime";
import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate";
import { isPostPublic } from "@/lib/blog";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import styles from "./page.module.css";

export const revalidate = 600;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
});

// generateMetadata and the page component both need the post; React's
// per-request cache() dedupes the underlying DB call between them without
// needing to touch src/lib/posts.ts.
const getCachedPostBySlug = cache(getPostBySlug);

interface PostPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: PostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getCachedPostBySlug(slug);

	if (!post) {
		return { title: "Post not found | Hammerspace" };
	}

	return {
		title: `${post.title} | Hammerspace`,
		description: post.excerpt || "",
		alternates: {
			canonical: `https://www.hammerspace.com/posts/${post.slug}`,
		},
		openGraph: {
			type: "article",
			title: post.title,
			description: post.excerpt || "",
			images: post.coverImageUrl
				? [{ url: post.coverImageUrl, alt: post.coverImageAlt || post.title }]
				: undefined,
		},
	};
}

export default async function PostPage({ params }: PostPageProps) {
	const { slug } = await params;
	const post = await getCachedPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const relatedPosts = await getRelatedPosts(post.id, post.tags);

	return (
		<article>
			<SiteTemplate
				header={
					<SidePageHeader title={post.title}>
						<div className={styles.metaRow}>
							<div className={styles.meta}>
								By <b>David Marland</b>
								<br />
								{post.publishedAt && (
									<>
										<time dateTime={post.publishedAt.toISOString()}>
											{dateFormatter.format(post.publishedAt)}
										</time>{" "}
										·{" "}
									</>
								)}
								<ReadingTime wordCount={post.wordCount} />
							</div>
						</div>
						{post.tags.length > 0 && (
							<ul className={styles.tags}>
								{post.tags.map((tag) => (
									<li key={tag.slug}>
										<Link href={`/tags/${tag.slug}`}>#{tag.name}</Link>
									</li>
								))}
							</ul>
						)}
					</SidePageHeader>
				}
			>
				{post.status === "DRAFT" ? (
					<div data-state="warning" className="piko-state__box">
						<p>This post is a DRAFT. This is not the final URL for sharing.</p>
					</div>
				) : (
					post.publishedAt &&
					!isPostPublic(post.publishedAt) && (
						<div data-state="info" className="piko-state__box">
							<p>
								This post is scheduled for publication at{" "}
								{new Date(post.publishedAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "short",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
									hour12: false,
								})}
							</p>
						</div>
					)
				)}

				<PostBody post={post} />

				{relatedPosts.length > 0 && (
					<aside className="piko-vstack--small">
						<h2>Related posts</h2>
						<ul className={styles.relatedList}>
							{relatedPosts.map((relatedPost) => (
								<li key={relatedPost.id}>
									<PostCard post={relatedPost} headingLevel="h3" />
								</li>
							))}
						</ul>
					</aside>
				)}
			</SiteTemplate>
		</article>
	);
}
