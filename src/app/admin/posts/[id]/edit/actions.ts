"use server";

import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { slugBelongsToDifferentPost } from "@/lib/post-form-actions";
import {
	deletePostAction,
	unpublishPostAction,
	updatePostAction,
} from "@/lib/actions/post-actions";
import type { PostFormActionState } from "@/components/Admin/PostEditorForm";
import {
	errorMessage,
	fieldErrorsFrom,
	parsePostFormData,
} from "@/app/admin/posts/post-form-shared";

/**
 * Adapter passed to `PostEditorForm`'s `formAction` prop (bound to `postId`
 * with `.bind(null, postId)` before being handed to the client component,
 * since `useActionState` actions must have exactly the
 * `(prevState, formData)` shape). Also re-validates that the submitted slug
 * isn't already used by a different post, on top of the schema checks
 * `new/actions.ts`'s `createPostFormAction` runs.
 */
export async function updatePostFormAction(
	postId: string,
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

	if (await slugBelongsToDifferentPost(parsed.data.slug, postId)) {
		return { errors: { slug: ["This slug is already in use."] } };
	}

	try {
		await updatePostAction(postId, parsed.data);
	} catch (error) {
		return { message: errorMessage(error, "Failed to update post.") };
	}

	// Stay on the edit page after a successful save instead of redirecting,
	// so the form reflects the freshly saved values.
	return null;
}

/**
 * Bound (via `.bind(null, postId)`) to `ConfirmDelete`'s `deleteAction` prop
 * on the edit page's "Unpublish" confirmation dialog.
 */
export async function unpublishPostAndStay(postId: string) {
	await unpublishPostAction(postId);
}

/**
 * Bound (via `.bind(null, postId)`) to `ConfirmDelete`'s `deleteAction` prop
 * on the edit page's "Delete" confirmation dialog. `deletePostAction` itself
 * doesn't redirect (it's a shared primitive also usable elsewhere), so this
 * adds the redirect-to-list behavior after a successful delete.
 */
export async function deletePostAndRedirect(postId: string) {
	await deletePostAction(postId);
	redirect("/admin/posts");
}
