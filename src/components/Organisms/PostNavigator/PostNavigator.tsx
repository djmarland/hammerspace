import type { PublicPostDetail } from "@/lib/posts.ts";
import { getNextPost, getPreviousPost } from "@/lib/posts.ts";
import styles from "./PostNavigator.module.css";
import Link from "next/link";
import { cx } from "@/components/cx.ts";
import { PublicationDate } from "@/components/Atoms/PublicationDate.tsx";

export const PostNavigator = async ({
	currentPost,
}: {
	currentPost: PublicPostDetail;
}) => {
	const [nextPost, previousPost] = await Promise.all([
		getNextPost(currentPost),
		getPreviousPost(currentPost),
	]);

	return (
		<nav className={styles.postNavigator}>
			{previousPost && (
				<Link
					href={`/posts/${previousPost.slug}`}
					className={cx(styles.link, styles.prev)}
				>
					{previousPost.title}
					<PublicationDate
						date={previousPost.publishedAt}
						className="piko-t-meta"
					/>
				</Link>
			)}
			{nextPost && (
				<Link
					href={`/posts/${nextPost.slug}`}
					className={cx(styles.link, styles.next)}
				>
					{nextPost.title}
					<PublicationDate
						date={nextPost.publishedAt}
						className="piko-t-meta"
					/>
				</Link>
			)}
		</nav>
	);
};
