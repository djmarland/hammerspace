import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updatePostAction } from "@/actions/post-form-actions";
import { getPostById } from "@/actions/posts";
import PostEditorForm from "@/components/Admin/PostEditorForm";
import { getAdminSessionUser } from "@/lib/admin-auth";
import styles from "./page.module.css";

interface EditPostPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const { id } = await params;
	const post = await getPostById(id);
	if (!post) {
		notFound();
	}

	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<h1>Edit Post</h1>
				<Link href="/admin/posts" className={styles.backLink}>
					Back to posts
				</Link>
			</header>

			<PostEditorForm
				action={updatePostAction.bind(null, id)}
				submitLabel="Save changes"
				initialValues={{
					title: post.title,
					slug: post.slug,
					excerpt: post.excerpt ?? "",
					content: post.content,
					published: post.published,
				}}
			/>
		</main>
	);
}
