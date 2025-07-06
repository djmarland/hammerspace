import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/ApiClient";
import { EditPostFields } from "./EditPostForm";
import { getPostForEditing } from "@/services/posts";

export async function editPost(formData: FormData) {
	"use server";

	const id = formData.get("id");
	if (!id) throw new Error("Post ID is required");

	try {
		await apiClient.put(`/cms/posts/${id}`, {
			title: formData.get("title"),
			content: formData.get("content"),
		});
		revalidatePath(`/cms/${id}`);
		revalidatePath(`/posts/${id}`);
		return { success: true, message: "Successfully saved" };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return { success: false, error: errorMessage };
	}
}

export default async function EditPostPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams?: { message?: string; error?: string };
}) {
	const { id } = await params;
	const post = await getPostForEditing(id);
	return (
		<div>
			<h1>Edit Post</h1>
			{searchParams?.message && (
				<div className={"success"}>{searchParams.message}</div>
			)}
			{searchParams?.error && (
				<div className={"error"}>{searchParams.error}</div>
			)}
			<form action={editPost as any}>
				<EditPostFields
					id={post.id}
					title={post.title}
					content={post.content}
				/>
				<button type="submit">Update Post</button>
			</form>
		</div>
	);
}
