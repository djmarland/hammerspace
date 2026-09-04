import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createPostFromValues, validateTagIds } from "@/lib/post-form-actions";
import { getTagsForAdmin } from "@/lib/posts";
import { superValidate, message } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { postSchema } from "@/lib/post-form";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, "/admin/login");
	}

	const tags = await getTagsForAdmin();
	const form = await superValidate(zod4(postSchema));
	return { tags, form };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(postSchema));

		if (!locals.session) {
			return message(form, "You must be logged in as an admin.", {
				status: 401,
			});
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!(await validateTagIds(form.data.tagIds))) {
			return message(form, "One or more selected tags no longer exist.", {
				status: 400,
			});
		}

		await createPostFromValues(form.data, locals.session.userId);

		throw redirect(303, "/admin/posts");
	},
};
