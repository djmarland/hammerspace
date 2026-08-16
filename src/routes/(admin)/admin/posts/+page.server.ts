import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { deletePostAction } from "@/lib/post-form-actions";
import { getAllPostsForAdmin } from "@/lib/posts";

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.session) {
		throw redirect(302, "/admin/login");
	}

	const query = url.searchParams.get("query") || "";
	const page = url.searchParams.get("page") || "1";

	const result = await getAllPostsForAdmin({
		query,
		page,
	});

	return result;
};

export const actions: Actions = {
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
