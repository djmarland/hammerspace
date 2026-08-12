import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPostBySlug, getRelatedPosts } from "@/actions/posts";
import { MarkdownContent } from "@/components/Blog/MarkdownContent";
import PostCard from "@/components/Blog/PostCard";
import { absoluteUrl, site } from "@/lib/site";
import styles from "./page.module.css";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
});

interface BlogPostPageProps {
	params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params;
	const post = await getPublicPostBySlug(slug);
	if (!post) {
		notFound();
	}
	const relatedPosts = await getRelatedPosts(post.id, post.tags);

	return (
		<main className={styles.container}>
			<p>
				<Link href="/blog" className={styles.backLink}>
					← Back to archive
				</Link>
			</p>

			<article className={styles.article}>
				<header className={styles.header}>
					<div className={styles.metaRow}>
						<p className={styles.meta}>
							By {post.authorName} · <time dateTime={post.publishedAt.toISOString()}>{dateFormatter.format(post.publishedAt)}</time> · {post.readingTimeMinutes} min read
						</p>
						{post.status !== "PUBLISHED" && <span className={styles.status}>{post.statusLabel}</span>}
					</div>
					<h1>{post.title}</h1>
					{post.tags.length > 0 && (
						<ul className={styles.tags}>
							{post.tags.map((tag) => (
								<li key={tag.slug}>
									<Link href={`/tags/${tag.slug}`}>#{tag.name}</Link>
								</li>
							))}
						</ul>
					)}
				</header>

				{post.coverImageUrl && (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={post.coverImageUrl}
							alt={post.coverImageAlt || ""}
							className={styles.image}
						/>
					</>
				)}
				<div className={styles.markdown}>
					<MarkdownContent content={post.content} />
				</div>
			</article>

			{relatedPosts.length > 0 && (
				<section className={styles.relatedSection}>
					<div className={styles.relatedHeader}>
						<h2>Related posts</h2>
						<p>More posts sharing one or more tags with this article.</p>
					</div>
					<div className={styles.relatedList}>
						{relatedPosts.map((relatedPost) => (
							<PostCard key={relatedPost.id} post={relatedPost} headingLevel="h3" />
						))}
					</div>
				</section>
			)}
		</main>
	);
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPublicPostBySlug(slug);
	if (!post) return {};
	return {
		title: post.title,
		description: post.excerpt || site.description,
		alternates: { canonical: absoluteUrl(`/blog/${post.slug}`) },
		openGraph: {
			type: "article",
			title: post.title,
			description: post.excerpt || site.description,
			images: post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.coverImageAlt || post.title }] : [],
		},
	};
}
