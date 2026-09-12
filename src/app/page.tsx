import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Atoms/Logo/Logo";
import PostBody from "@/components/Blog/PostBody";
import ReadingTime from "@/components/Blog/ReadingTime";
import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate";
import { getLatestPublicPosts } from "@/lib/posts";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title:
		"Hammerspace - A blog about Web Development, Software Engineering, and Technology in general",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
});

export default async function HomePage() {
	const posts = await getLatestPublicPosts(5);

	return (
		<SiteTemplate
			header={
				<header className={styles.hero}>
					<h1 className={styles.logo}>
						<Logo />
					</h1>
					<p className={styles.intro}>
						A blog about Web Development, Software Engineering, and Technology
						in general, plus maybe other topics of interest.
						<br />
						By{" "}
						<b>
							<Link href="/about">David Marland</Link>
						</b>
					</p>
					<nav className={styles.actions}>
						<Link href="/posts">Browse archive</Link>
						<Link href="/feed.xml">RSS feed</Link>
					</nav>
				</header>
			}
		>
			<div className="piko-vstack">
				<section className="section">
					<div className={styles.postList}>
						{posts.map((post) => (
							<article key={post.id} className={styles.post}>
								<header className={styles.postHeader}>
									<h2 className={`${styles.postTitle} piko-t-h2`}>
										<Link href={`/posts/${post.slug}`}>{post.title}</Link>
									</h2>
									<div className={styles.meta}>
										{post.publishedAt && (
											<time dateTime={post.publishedAt.toISOString()}>
												{dateFormatter.format(post.publishedAt)}
											</time>
										)}
										{" · "}
										<ReadingTime wordCount={post.wordCount} />
									</div>
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
								<PostBody post={post} />
							</article>
						))}
					</div>
				</section>
				<section>
					<Link href="/posts" className="button">
						View all posts
					</Link>
				</section>
			</div>
		</SiteTemplate>
	);
}
