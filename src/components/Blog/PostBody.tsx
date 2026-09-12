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
		"content" | "coverImageUrl" | "coverImageAlt" | "wordCount"
	>;
}

export default function PostBody({ post }: PostBodyProps) {
	return (
		<div className={styles.body}>
			{post.coverImageUrl && (
				<img
					src={post.coverImageUrl}
					alt={post.coverImageAlt || ""}
					className={styles.image}
				/>
			)}
			<div className="markdown piko-prose">
				<MarkdownContent content={post.content} />
				<Socials />
			</div>
			<ReadingTime wordCount={post.wordCount} variant="footer" />
		</div>
	);
}
