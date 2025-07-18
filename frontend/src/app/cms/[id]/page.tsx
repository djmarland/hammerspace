import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/ApiClient";
import { EditPostFields } from "@/components/forms/EditPostForm/EditPostForm";
import { getPostForEditing } from "@/services/posts";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditPostPage({
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

	async function editPostAction(formData: FormData) {
		"use server";

		if (!post) {
			throw new Error("Post not found");
		}

		await apiClient.put(
			`/cms/posts/${post.id}`,
			Object.fromEntries(formData.entries()),
		);

		revalidatePath(`/cms/${post.id}`);
		revalidatePath(`${post.url}`);
	}

	return (
		<div>
			<div style={{ marginTop: "2rem" }}>
				<Link href={`/cms/${id}/publish`}>
					<span className="button">Publish</span>
				</Link>
			</div>

			<h1>Edit Post</h1>
			{message && <div className={"success"}>{message}</div>}
			{error && <div className={"error"}>{error}</div>}
			<form action={editPostAction}>
				<EditPostFields post={post} />
				<button type="submit">Update Post</button>
			</form>
		</div>
	);
}
