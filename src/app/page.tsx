import Link from "next/link";
import { getLatestPublicPosts } from "@/actions/posts";
import PostCard from "@/components/Blog/PostCard";
import styles from "./page.module.css";

export const revalidate = 60;

export default async function Home() {
	const posts = await getLatestPublicPosts(6);

	return (
		<main className={styles.container}>
			<header className={styles.hero}>
				<p className={styles.eyebrow}>Public-first publishing</p>
				<h1>Hammerspace Blog</h1>
				<p className={styles.intro}>
					Published posts and due scheduled posts appear here automatically. Drafts remain available only from their direct blog URL.
				</p>
				<form action="/search" className={styles.searchForm}>
					<input
						type="search"
						name="q"
						placeholder="Search posts"
						className={styles.searchInput}
					/>
					<button type="submit" className={styles.primaryLink}>
						Search
					</button>
				</form>
				<nav className={styles.actions}>
					<Link href="/blog" className={styles.secondaryLink}>
						Browse archive
					</Link>
					<Link href="/feed.xml" className={styles.secondaryLink}>
						RSS feed
					</Link>
					<Link href="/admin" className={styles.secondaryLink}>
						Admin
					</Link>
				</nav>
			</header>

			<section className={styles.section}>
				<div className={styles.sectionHeader}>
					<h2>Latest posts</h2>
					<p>{posts.length === 0 ? "No public posts yet." : `Showing ${posts.length} recent posts.`}</p>
				</div>
				<div className={styles.list}>
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			</section>
		</main>
	);
}
