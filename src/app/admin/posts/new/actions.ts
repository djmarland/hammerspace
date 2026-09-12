"use server";

import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
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
 * `PostFormValues` object, not a raw `FormData`/prevState pair, so this
 * validates the submitted `FormData` against `postSchema` itself before
 * delegating.
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

	try {
		await createPostAction(parsed.data);
	} catch (error) {
		return { message: errorMessage(error, "Failed to create post.") };
	}

	redirect("/admin/posts");
}
