import Link from "next/link";
import { getPublishedPosts } from "@/actions/posts";
import styles from "./page.module.css";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function Home() {
	const posts = await getPublishedPosts();

	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<h1>Hammerspace Blog</h1>
				<p>Welcome to the blog</p>
			</header>

			<nav className={styles.nav}>
				<a href="/">Home</a>
				<a href="/admin">Admin</a>
			</nav>

			<section className={styles.content}>
				{posts.length === 0 ? (
					<p>No published posts yet.</p>
				) : (
					<ul className={styles.postList}>
						{posts.map((post) => (
							<li key={post.id} className={styles.postItem}>
								<h2>
									<Link href={`/blog/${post.slug}`}>{post.title}</Link>
								</h2>
								<p>{post.excerpt || "No excerpt available."}</p>
								<p className={styles.postMeta}>
									By {post.author.name || "Unknown"} ·{" "}
									{new Intl.DateTimeFormat("en-GB", {
										dateStyle: "medium",
									}).format(post.createdAt)}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}
