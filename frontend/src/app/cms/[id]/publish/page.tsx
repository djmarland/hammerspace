import { getPostForEditing } from "@/services/posts";
import { PublishPostForm } from "@/components/forms/PublishPostForm/PublishPostForm";
import styles from "@/app/cms/new/page.module.css";
import { apiClient } from "@/lib/ApiClient";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export default async function PublishPostPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ message?: string; error?: string }>;
}) {
	const { id } = await params;
	const { message, error } = await searchParams;
	const post = await getPostForEditing(id);
	if (!post) {
		return notFound();
	}

	async function publishPostAction(formData: FormData) {
		"use server";

		if (!post) {
			throw new Error("Post not found");
		}

		await apiClient.post(
			`/cms/posts/${post.id}/publish`,
			Object.fromEntries(formData.entries()),
		);

		revalidatePath(`/cms/${post.id}`);
		revalidatePath(`${post.url}`);
	}

	return (
		<div>
			<h1>Publish Post: {post.title}</h1>
			{message && <div className={"success"}>{message}</div>}
			{error && <div className={"error"}>{error}</div>}

			<form action={publishPostAction} className={styles.form}>
				<PublishPostForm post={post} />
			</form>
		</div>
	);
}
