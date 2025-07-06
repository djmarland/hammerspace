import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { PostSummary } from "@/models/PostSummary";
import { apiClient } from "@/lib/ApiClient";
import { EditPostFields } from "../[id]/EditPostForm";

async function createPost(formData: FormData) {
	"use server";

	let post: PostSummary;
	try {
		post = await apiClient.post("/cms/create", {
			title: formData.get("title"),
			content: formData.get("content"),
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return redirect(
			"/cms/new?error=" +
				encodeURIComponent(
					`An error occurred while creating the post: ${errorMessage}`,
				),
		);
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
				<EditPostFields id="" title="" content="" />
				<div className={styles.buttons}>
					<button type="submit">Create Post</button>
				</div>
			</form>
		</div>
	);
}
