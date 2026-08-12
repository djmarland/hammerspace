import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { archivePostAction, deletePostAction, unpublishPostAction } from "@/lib/post-form-actions";
import { getAllPostsForAdmin } from "@/lib/posts";

export const load: PageServerLoad = async ({ url, locals }) => {
	const query = url.searchParams.get("query") || "";
	const status = (url.searchParams.get("status") || "ALL") as "ALL" | "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
	const page = url.searchParams.get("page") || "1";

	const result = await getAllPostsForAdmin({
		query,
		status,
		page,
	});

	return result;
};

export const actions: Actions = {
	archive: async ({ request }) => {
		try {
			const formData = await request.formData();
			await archivePostAction(formData);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : "Failed to archive post",
			});
		}
	},

	unpublish: async ({ request }) => {
		try {
			const formData = await request.formData();
			await unpublishPostAction(formData);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : "Failed to unpublish post",
			});
		}
	},

	delete: async ({ request }) => {
		try {
			const formData = await request.formData();
			await deletePostAction(formData);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : "Failed to delete post",
			});
		}
	},
};
