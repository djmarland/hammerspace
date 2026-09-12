import type { PublicPostSummary } from "@/lib/posts";
import MarkdownContent from "@/components/Blog/MarkdownContent";
import ReadingTime from "@/components/Blog/ReadingTime";
import Socials from "@/components/Molecules/Socials/Socials";
import styles from "./PostBody.module.css";

// "markdown" is a bare hook class with no matching CSS rule; "piko-prose"
// carries the actual prose styling.

interface PostBodyProps {
	post: Pick<
		PublicPostSummary,
		"slug" | "content" | "coverAsset" | "wordCount"
	>;
	// Set when this post is listed among others (e.g. the homepage), where
	// the post title is an h2 rather than the page's own h1. Also makes the
	// post body's heading links point back to the post's own page, since
	// this isn't it.
	demoteHeadings?: boolean;
}

export default function PostBody({ post, demoteHeadings }: PostBodyProps) {
	return (
		<div className={styles.body}>
			{post.coverAsset && (
				<img
					src={post.coverAsset.url}
					alt={post.coverAsset.alt || ""}
					className={styles.image}
				/>
			)}
			<div className="markdown piko-prose">
				<MarkdownContent
					content={post.content}
					demoteHeadings={demoteHeadings}
					headingLinkBase={demoteHeadings ? `/posts/${post.slug}` : undefined}
				/>
				<Socials />
			</div>
			<ReadingTime wordCount={post.wordCount} variant="footer" />
		</div>
	);
}
