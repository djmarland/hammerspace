import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { updatePostAction } from "@/lib/post-form-actions";
import { getPostById, getTagsForAdmin } from "@/lib/posts";

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPostById(params.id);
	const tags = await getTagsForAdmin();

	if (!post) {
		throw redirect(303, "/admin/posts");
	}

	return { post, tags };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const state = await updatePostAction(params.id, undefined, formData);

		if (state.formError || Object.keys(state.fieldErrors).length > 0) {
			return fail(400, state);
		}

		throw redirect(303, "/admin/posts");
	},
};
