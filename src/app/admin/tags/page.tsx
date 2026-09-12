import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { getTagsForAdmin } from "@/lib/posts";
import TagsManager from "./TagsManager";
import {
	createTagFormAction,
	deleteTagById,
	updateTagFormAction,
} from "./actions";

export const metadata: Metadata = {
	title: "Manage Tags",
};

export default async function AdminTagsPage() {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const tags = await getTagsForAdmin();

	return (
		<div className="piko-page-container piko-vstack">
			<h1 className="piko-t-h1">Manage Tags</h1>
			<TagsManager
				tags={tags}
				createAction={createTagFormAction}
				updateAction={updateTagFormAction}
				deleteAction={deleteTagById}
			/>
		</div>
	);
}
