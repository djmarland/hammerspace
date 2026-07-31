import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllPostsForAdmin } from "@/actions/posts";
import { getAdminSessionUser } from "@/lib/admin-auth";
import styles from "./page.module.css";

export default async function AdminPostsPage() {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const posts = await getAllPostsForAdmin();

	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<h1>Manage Posts</h1>
				<Link href="/admin/posts/new" className={styles.button}>
					New Post
				</Link>
			</header>

			{posts.length === 0 ? (
				<p className={styles.empty}>No posts yet. Create your first one.</p>
			) : (
				<ul className={styles.list}>
					{posts.map((post) => (
						<li key={post.id} className={styles.item}>
							<div>
								<h2>{post.title}</h2>
								<p className={styles.meta}>
									/{post.slug} · {post.published ? "Published" : "Draft"} · By{" "}
									{post.author.name || "Unknown"}
								</p>
							</div>
							<Link href={`/admin/posts/${post.id}/edit`} className={styles.link}>
								Edit
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
