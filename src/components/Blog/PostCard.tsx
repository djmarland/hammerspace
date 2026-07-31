import Link from "next/link";
import type { PublicPostSummary } from "@/actions/posts";
import styles from "./PostCard.module.css";

interface PostCardProps {
	post: PublicPostSummary;
	headingLevel?: "h2" | "h3";
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
});

export default function PostCard({ post, headingLevel = "h2" }: PostCardProps) {
	const HeadingTag = headingLevel;
	const shouldShowStatus = post.status !== "PUBLISHED";

	return (
		<article className={styles.card}>
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
			<div className={styles.content}>
				<div className={styles.metaRow}>
					<p className={styles.meta}>
						By {post.authorName} · <time dateTime={post.publishedAt.toISOString()}>{dateFormatter.format(post.publishedAt)}</time> · {post.readingTimeMinutes} min read
					</p>
					{shouldShowStatus && <span className={styles.status}>{post.statusLabel}</span>}
				</div>
				<HeadingTag className={styles.title}>
					<Link href={`/blog/${post.slug}`}>{post.title}</Link>
				</HeadingTag>
				<p className={styles.excerpt}>{post.excerpt || "No excerpt available."}</p>
				{post.tags.length > 0 && (
					<ul className={styles.tags}>
						{post.tags.map((tag) => (
							<li key={tag.slug}>
								<Link href={`/tags/${tag.slug}`}>#{tag.name}</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		</article>
	);
}
