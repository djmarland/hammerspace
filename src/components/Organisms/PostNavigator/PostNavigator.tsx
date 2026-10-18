import type { PublicPostDetail } from "@/lib/posts.ts";
import { getNextPost, getPreviousPost } from "@/lib/posts.ts";
import styles from "./PostNavigator.module.css";
import Link from "next/link";
import { cx } from "@/components/cx.ts";
import { PublicationDate } from "@/components/Atoms/PublicationDate.tsx";
import { RssIcon } from "@/components/Icons/RssIcon.tsx";

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
		<aside className={styles.wrap}>
			<nav className={styles.postNavigator}>
				{previousPost && (
					<Link
						href={`/posts/${previousPost.slug}`}
						className={cx(styles.link, styles.arrow, styles.prev)}
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
						className={cx(styles.link, styles.arrow, styles.next)}
					>
						{nextPost.title}
						<PublicationDate
							date={nextPost.publishedAt}
							className="piko-t-meta"
						/>
					</Link>
				)}
				<Link
					href="/posts"
					className={cx(styles.link, styles.all, "piko-icon-link")}
				>
					All Posts
				</Link>
				<a
					href="/feed.xml"
					className={cx(styles.link, styles.feed, "piko-icon-link")}
				>
					<RssIcon />
					RSS feed
				</a>
			</nav>
		</aside>
	);
};
