import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createTagAction, deleteTagAction, updateTagAction } from "@/lib/tags";
import { getTagsForAdmin } from "@/lib/posts";

export const load: PageServerLoad = async () => {
	const tags = await getTagsForAdmin();
	return { tags };
};

export const actions: Actions = {
	create: async ({ request }) => {
		try {
			const formData = await request.formData();
			await createTagAction(formData);
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : "Failed to create tag",
			});
		}
		throw redirect(303, "/admin/tags");
	},

	delete: async ({ request }) => {
		try {
			const formData = await request.formData();
			await deleteTagAction(formData);
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : "Failed to delete tag",
			});
		}
		throw redirect(303, "/admin/tags");
	},

	update: async ({ request }) => {
		try {
			const formData = await request.formData();
			await updateTagAction(formData);
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : "Failed to update tag",
			});
		}
		throw redirect(303, "/admin/tags");
	},
};
