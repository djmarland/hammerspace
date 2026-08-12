import { redirect } from "next/navigation";
import { createTagAction, deleteTagAction, updateTagAction } from "@/actions/tags";
import { getTagsForAdmin } from "@/actions/posts";
import { getAdminSessionUser } from "@/lib/admin-auth";
import styles from "../posts/page.module.css";

interface AdminTagsPageProps {
	searchParams: Promise<{ error?: string }>;
}

export default async function AdminTagsPage({ searchParams }: AdminTagsPageProps) {
	if (!(await getAdminSessionUser())) redirect("/admin/login");
	const [tags, { error }] = await Promise.all([getTagsForAdmin(), searchParams]);
	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<h1>Manage Tags</h1>
			</header>
			<form action={createTagAction} className={styles.header}>
				<label>
					<span>New tag</span>
					<input name="name" required />
				</label>
				<button type="submit" className={styles.button}>Create tag</button>
			</form>
			{error && <p className={styles.empty}>A tag with that name or slug already exists.</p>}
			{tags.length === 0 ? (
				<p className={styles.empty}>No tags yet.</p>
			) : (
				<ul className={styles.list}>
					{tags.map((tag) => (
						<li key={tag.id} className={styles.item}>
							<form action={updateTagAction}>
								<input type="hidden" name="tagId" value={tag.id} />
								<label>
									<span className={styles.meta}>Tag name</span>
									<input name="name" defaultValue={tag.name} required />
								</label>
								<p className={styles.meta}>/{tag.slug} · {tag._count.posts} posts</p>
								<button type="submit">Save</button>
							</form>
							<form action={deleteTagAction}>
								<input type="hidden" name="tagId" value={tag.id} />
								<button type="submit">Delete</button>
							</form>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
