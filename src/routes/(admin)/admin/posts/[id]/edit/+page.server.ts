import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
	deletePostAction,
	slugBelongsToDifferentPost,
	unpublishPostAction,
	updatePostFromValues,
	validateTagIds,
} from "@/lib/post-form-actions";
import { getPostById, getTagsForAdmin } from "@/lib/posts";
import { superValidate, setError, message } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { postSchema } from "@/lib/post-form";

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.session) {
		throw redirect(302, "/admin/login");
	}

	const post = await getPostById(params.id);
	const tags = await getTagsForAdmin();

	if (!post) {
		throw redirect(303, "/admin/posts");
	}

	const form = await superValidate(
		{
			title: post.title,
			slug: post.slug,
			excerpt: post.excerpt || "",
			content: post.content,
			coverImageUrl: post.coverImageUrl || "",
			coverImageAlt: post.coverImageAlt || "",
			tagIds: post.tags.map((tag) => tag.tagId),
		},
		zod4(postSchema),
	);

	return { post, tags, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const form = await superValidate(request, zod4(postSchema));

		if (!locals.session) {
			return message(form, "You must be logged in as an admin.", {
				status: 401,
			});
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		if (await slugBelongsToDifferentPost(form.data.slug, params.id)) {
			return setError(form, "slug", "This slug is already in use.");
		}

		if (!(await validateTagIds(form.data.tagIds))) {
			return message(form, "One or more selected tags no longer exist.", {
				status: 400,
			});
		}

		await updatePostFromValues(params.id, form.data);

		return { form };
	},

	unpublish: async ({ params, locals }) => {
		if (!locals.session) {
			throw redirect(302, "/admin/login");
		}

		if (!params.id) {
			return fail(400, { formError: "Missing post ID" });
		}

		try {
			await unpublishPostAction(params.id);
		} catch (error) {
			return fail(400, {
				formError:
					error instanceof Error ? error.message : "Failed to unpublish post",
			});
		}
	},

	delete: async ({ params, locals }) => {
		if (!locals.session) {
			throw redirect(302, "/admin/login");
		}

		if (!params.id) {
			return fail(400, { formError: "Missing post ID" });
		}

		try {
			await deletePostAction(params.id);
		} catch (error) {
			return fail(400, {
				formError:
					error instanceof Error ? error.message : "Failed to delete post",
			});
		}

		throw redirect(303, "/admin/posts");
	},
} satisfies Actions;
