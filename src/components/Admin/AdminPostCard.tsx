import Link from "next/link";
import { isPostPublic } from "@/lib/blog";
import type { AdminPostSummary } from "@/lib/posts";
import Pill from "@/components/Atoms/Pill/Pill";
import styles from "./AdminPostCard.module.css";

interface AdminPostCardProps {
	post: AdminPostSummary;
	headingLevel?: "h2" | "h3";
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
});

function describePost(post: AdminPostSummary) {
	if (!post.publishedAt) {
		return {
			label: "Draft",
			state: "warning",
			date: post.updatedAt,
			datePrefix: "Updated",
		} as const;
	}
	if (!isPostPublic(post.publishedAt)) {
		return {
			label: "Scheduled",
			state: "success",
			date: post.publishedAt,
			datePrefix: "Goes live",
		} as const;
	}
	return {
		label: null,
		state: undefined,
		date: post.publishedAt,
		datePrefix: "Published",
	} as const;
}

export default function AdminPostCard({
	post,
	headingLevel = "h3",
}: AdminPostCardProps) {
	const { label, state, date, datePrefix } = describePost(post);
	const Heading = headingLevel;
	const isPublished = state === undefined;

	return (
		<article
			className={`${state ? "piko-state__box" : "piko-card"} ${styles.card}`}
			data-state={state}
		>
			<div className="piko-vstack--small">
				<Heading className="piko-t-h4">
					<Link href={`/admin/posts/${post.id}/edit`} className={styles.link}>
						{post.title || "Untitled"}
					</Link>
				</Heading>
				{label && (
					<div className={styles.pills}>
						<Pill>{label}</Pill>
					</div>
				)}
				<p className="piko-t-meta">
					{datePrefix}{" "}
					<time dateTime={date.toISOString()}>
						{dateFormatter.format(date)}
					</time>
				</p>
				<p className={styles.slug}>{post.slug}</p>
			</div>

			<div className={`piko-hstack--small ${styles.actions}`}>
				<Link className="piko-button" href={`/posts/${post.slug}`}>
					{isPublished ? "View" : "Preview"}
				</Link>
				{!isPublished && (
					<Link
						className="piko-button--primary"
						href={`/admin/posts/${post.id}/publish`}
					>
						Publish
					</Link>
				)}
			</div>
		</article>
	);
}
