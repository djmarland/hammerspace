import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { PostSummaryItem } from "@/models/PostSummary";
import { apiClient } from "@/lib/ApiClient";
import { EditPostFields } from "@/components/forms/EditPostForm/EditPostForm";

async function createPost(formData: FormData) {
	"use server";

	const post: PostSummaryItem = await apiClient.post(
		"/cms/create",
		Object.fromEntries(formData.entries()),
	);
	if (!post) {
		throw new Error("Failed to create post");
	}
	return redirect(`/cms/${post.id}`);
}

export default async function NewPost({
	searchParams,
}: {
	searchParams:
		| Promise<Record<string, string | string[] | undefined>>
		| Record<string, string | string[] | undefined>;
}) {
	const params = await searchParams;
	const error = params?.error;

	return (
		<div>
			<h1>Create New Post</h1>
			{error && <div className={styles.error}>{error}</div>}
			<form action={createPost} className={styles.form}>
				<EditPostFields />
				<div className={styles.buttons}>
					<button type="submit">Create Post</button>
				</div>
			</form>
		</div>
	);
}
