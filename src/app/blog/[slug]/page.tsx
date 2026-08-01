import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/actions/posts";
import styles from "./page.module.css";

interface BlogPostPageProps {
	params: Promise<{ slug: string }>;
}

function renderMarkdown(markdown: string) {
	const lines = markdown.split("\n");
	return lines.map((line, index) => {
		const trimmed = line.trim();
		if (!trimmed) {
			return null;
		}
		if (trimmed.startsWith("### ")) {
			return <h3 key={`h3-${index}`}>{trimmed.slice(4)}</h3>;
		}
		if (trimmed.startsWith("## ")) {
			return <h2 key={`h2-${index}`}>{trimmed.slice(3)}</h2>;
		}
		if (trimmed.startsWith("# ")) {
			return <h1 key={`h1-${index}`}>{trimmed.slice(2)}</h1>;
		}
		if (trimmed.startsWith("- ")) {
			return (
				<ul key={`ul-${index}`}>
					<li>{trimmed.slice(2)}</li>
				</ul>
			);
		}
		return <p key={`p-${index}`}>{trimmed}</p>;
	});
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);
	if (!post) {
		notFound();
	}

	return (
		<main className={styles.container}>
			<p>
				<Link href="/" className={styles.backLink}>
					← Back to posts
				</Link>
			</p>

			<article>
				<header className={styles.header}>
					<h1>{post.title}</h1>
					<p className={styles.meta}>
						By {post.author.name || "Unknown"} ·{" "}
						{new Intl.DateTimeFormat("en-GB", {
							dateStyle: "medium",
						}).format(post.createdAt)}
					</p>
				</header>

				<div className={styles.markdown}>{renderMarkdown(post.content)}</div>
			</article>
		</main>
	);
}
