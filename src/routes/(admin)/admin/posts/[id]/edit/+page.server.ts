import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { deletePostAction, updatePostAction } from "@/lib/post-form-actions";
import { getPostById, getTagsForAdmin } from "@/lib/posts";

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.session) {
		throw redirect(302, "/admin/login");
	}

	const post = await getPostById(params.id);
	const tags = await getTagsForAdmin();

	if (!post) {
		throw redirect(303, "/admin/posts");
	}

	return { post, tags };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const state = await updatePostAction(params.id, undefined, formData);

		if (state.formError || Object.keys(state.fieldErrors).length > 0) {
			return fail(400, state);
		}

		throw redirect(303, "/admin/posts");
	},

	delete: async ({ request }) => {
		try {
			const formData = await request.formData();
			await deletePostAction(formData);
			throw redirect(303, "/admin/posts");
		} catch (error) {
			if (error instanceof Error && error.message.includes("redirect")) {
				throw error;
			}
			return fail(400, {
				error: error instanceof Error ? error.message : "Failed to delete post",
			});
		}
	},
};
