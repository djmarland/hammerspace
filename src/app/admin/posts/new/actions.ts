"use server";

import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { validateTagIds } from "@/lib/post-form-actions";
import { createPostAction } from "@/lib/actions/post-actions";
import type { PostFormActionState } from "@/components/Admin/PostEditorForm";
import {
	errorMessage,
	fieldErrorsFrom,
	parsePostFormData,
} from "@/app/admin/posts/post-form-shared";

/**
 * Adapter passed to `PostEditorForm`'s `formAction` prop. `createPostAction`
 * (from `@/lib/actions/post-actions.ts`) takes an already-validated
 * `PostFormValues` object plus an `authorId`, not a raw `FormData`/prevState
 * pair, so this validates the submitted `FormData` against `postSchema`
 * itself before delegating.
 */
export async function createPostFormAction(
	_prevState: PostFormActionState,
	formData: FormData,
): Promise<PostFormActionState> {
	const session = await getAdminSessionUser();
	if (!session) {
		return { message: "You must be logged in as an admin." };
	}

	const parsed = parsePostFormData(formData);
	if (!parsed.success) {
		return { errors: fieldErrorsFrom(parsed.error) };
	}

	if (!(await validateTagIds(parsed.data.tagIds))) {
		return { message: "One or more selected tags no longer exist." };
	}

	try {
		await createPostAction(parsed.data, session.userId);
	} catch (error) {
		return { message: errorMessage(error, "Failed to create post.") };
	}

	redirect("/admin/posts");
}
