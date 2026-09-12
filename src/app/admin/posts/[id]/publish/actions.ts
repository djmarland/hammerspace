"use server";

import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { getPostById } from "@/lib/posts";
import { slugBelongsToDifferentPost } from "@/lib/post-form-actions";
import { publishPostAction } from "@/lib/actions/post-actions";
import { publishSchema } from "@/lib/post-form";

export type PublishFormActionState = {
	errors?: Record<string, string[]>;
	message?: string;
} | null;

function getString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

/**
 * Adapter passed (bound to `postId` via `.bind(null, postId)`) to
 * `PublishForm`'s `formAction` prop. `publishPostAction` (from
 * `@/lib/actions/post-actions.ts`) takes an already-validated
 * `PublishFormValues` object, not a raw `FormData`/prevState pair, so this
 * validates against `publishSchema` and re-checks slug uniqueness (only
 * relevant when rescheduling an already-published post - a first publish's
 * slug is made unique by `publishPostAction` itself via the date suffix)
 * before delegating.
 */
export async function publishPostFormAction(
	postId: string,
	_prevState: PublishFormActionState,
	formData: FormData,
): Promise<PublishFormActionState> {
	const session = await getAdminSessionUser();
	if (!session) {
		return { message: "You must be logged in as an admin." };
	}

	const parsed = publishSchema.safeParse({
		slug: getString(formData, "slug"),
		publishedAt: getString(formData, "publishedAt"),
	});

	if (!parsed.success) {
		const { fieldErrors } = parsed.error.flatten();
		const errors: Record<string, string[]> = {};
		for (const [key, value] of Object.entries(fieldErrors)) {
			if (value) {
				errors[key] = value;
			}
		}
		return { errors };
	}

	const post = await getPostById(postId);
	if (!post) {
		redirect("/admin/posts");
	}

	if (
		post.publishedAt &&
		(await slugBelongsToDifferentPost(parsed.data.slug, postId))
	) {
		return { errors: { slug: ["This slug is already in use."] } };
	}

	try {
		await publishPostAction(postId, parsed.data);
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Failed to publish post.",
		};
	}

	redirect(`/admin/posts/${postId}/edit`);
}
