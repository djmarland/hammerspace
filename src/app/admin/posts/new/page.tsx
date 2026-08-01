import Link from "next/link";
import { redirect } from "next/navigation";
import { createPostAction } from "@/actions/post-form-actions";
import PostEditorForm from "@/components/Admin/PostEditorForm";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { getTagsForAdmin } from "@/actions/posts";
import styles from "./page.module.css";

export default async function NewPostPage() {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}
	const tags = await getTagsForAdmin();

	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<h1>Create Post</h1>
				<Link href="/admin/posts" className={styles.backLink}>
					Back to posts
				</Link>
			</header>

			<PostEditorForm action={createPostAction} submitLabel="Create post" tags={tags} />
		</main>
	);
}
