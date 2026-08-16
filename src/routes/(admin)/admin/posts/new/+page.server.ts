import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createPostAction } from "@/lib/post-form-actions";
import { getTagsForAdmin } from "@/lib/posts";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, "/admin/login");
	}

	const tags = await getTagsForAdmin();
	return { tags };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const state = await createPostAction(undefined, formData);

		if (state.formError || Object.keys(state.fieldErrors).length > 0) {
			return fail(400, state);
		}

		throw redirect(303, "/admin/posts");
	},
};
