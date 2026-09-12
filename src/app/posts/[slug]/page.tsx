import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import PostBody from "@/components/Blog/PostBody";
import SidePageHeader from "@/components/Blog/SidePageHeader";
import ReadingTime from "@/components/Blog/ReadingTime";
import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate";
import { isPostPublic } from "@/lib/blog";
import { getPostBySlug } from "@/lib/posts";
import styles from "./page.module.css";
import { PostNavigator } from "@/components/Organisms/PostNavigator/PostNavigator.tsx";
import { PublicationDate } from "@/components/Atoms/PublicationDate.tsx";

export const revalidate = 600;

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
		alternates: {
			canonical: `https://www.hammerspace.com/posts/${post.slug}`,
		},
		openGraph: {
			type: "article",
			title: post.title,
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

	return (
		<article>
			<SiteTemplate
				header={
					<SidePageHeader title={post.title}>
						<div className={styles.metaRow}>
							<div className={styles.meta}>
								By <b>David Marland</b>
								<br />
								<PublicationDate date={post.publishedAt} /> ·{" "}
								<ReadingTime wordCount={post.wordCount} />
							</div>
						</div>
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
				<hr />
				<PostNavigator currentPost={post} />
			</SiteTemplate>
		</article>
	);
}
