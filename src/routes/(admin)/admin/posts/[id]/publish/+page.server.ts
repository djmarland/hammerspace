import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
	publishPostAction,
	slugBelongsToDifferentPost,
} from "@/lib/post-form-actions";
import { getPostById } from "@/lib/posts";
import { superValidate, setError, message } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { publishSchema } from "@/lib/post-form";
import { formatDateTimeLocalValue } from "@/lib/temporal";

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.session) {
		throw redirect(302, "/admin/login");
	}

	const post = await getPostById(params.id);

	if (!post) {
		throw redirect(303, "/admin/posts");
	}

	const form = await superValidate(
		{
			slug: post.slug,
			publishedAt: post.publishedAt
				? formatDateTimeLocalValue(new Date(post.publishedAt))
				: formatDateTimeLocalValue(new Date()),
		},
		zod4(publishSchema),
	);

	return { post, form };
};

export const actions: Actions = {
	publish: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(publishSchema));

		if (!locals.session) {
			return message(form, "You must be logged in as an admin.", {
				status: 401,
			});
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		// If the post is already published, the slug is used as-is (no date
		// suffix gets appended again), so it must be checked for uniqueness
		// here. A first-time publish appends a "-mm-yyyy" suffix that already
		// guarantees uniqueness (see publishPostAction).
		const post = await getPostById(params.id);
		if (!post) {
			throw redirect(303, "/admin/posts");
		}

		if (
			post.publishedAt &&
			(await slugBelongsToDifferentPost(form.data.slug, params.id))
		) {
			return setError(form, "slug", "This slug is already in use.");
		}

		await publishPostAction(params.id, form.data);

		throw redirect(303, `/admin/posts/${params.id}/edit`);
	},
} satisfies Actions;
