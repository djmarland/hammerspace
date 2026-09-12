import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { getTagsForAdmin } from "@/lib/posts";
import PostEditorForm from "@/components/Admin/PostEditorForm";
import { createPostFormAction } from "./actions";

export const metadata: Metadata = {
	title: "Create New Post",
};

export default async function NewPostPage() {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const tags = await getTagsForAdmin();

	return (
		<div className="piko-vstack">
			<div className="piko-page-container">
				<h1 className="piko-t-h1">Create New Post</h1>
			</div>
			<PostEditorForm
				formAction={createPostFormAction}
				submitLabel="Create Post"
				tags={tags}
				mode="create"
			/>
		</div>
	);
}
