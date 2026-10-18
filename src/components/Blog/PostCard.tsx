import Link from "next/link";
import CoverHeading from "@/components/Blog/CoverHeading";
import type { PublicPostSummary } from "@/lib/posts";
import styles from "./PostCard.module.css";

interface PostCardProps {
	post: PublicPostSummary;
	headingLevel?: "h2" | "h3";
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
});

export default function PostCard({ post, headingLevel = "h2" }: PostCardProps) {
	const Heading = headingLevel;

	return (
		<CoverHeading
			as="article"
			solid
			coverAsset={post.coverAsset}
			className={`piko-card ${styles.card}`}
		>
			<p className="piko-t-meta">
				{/*
				 * PublicPostSummary.publishedAt is typed Date | null; public
				 * listings only ever include discoverable (published) posts,
				 * but this guard keeps strict TypeScript happy without
				 * assuming that invariant.
				 */}
				{post.publishedAt && (
					<time dateTime={post.publishedAt.toISOString()}>
						{dateFormatter.format(post.publishedAt)}
					</time>
				)}
				{" · "}
				{post.readingTimeMinutes} min read
			</p>
			<Heading>
				<Link href={`/posts/${post.slug}`} className={styles.link}>
					{post.title}
				</Link>
			</Heading>
		</CoverHeading>
	);
}
