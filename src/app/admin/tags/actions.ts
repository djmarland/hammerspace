"use server";

import {
	createTagAction,
	deleteTagAction,
	updateTagAction,
} from "@/lib/actions/tag-actions";

export type TagFormActionState = { error?: string } | null;

/**
 * Adapter passed to `TagsManager`'s create-form `useActionState` action.
 * `createTagAction` (from `@/lib/actions/tag-actions.ts`) takes a raw
 * `FormData` already, matching the second parameter here directly - the
 * only bridging needed is catching the plain `Error` it throws on failure
 * and turning it into state `useActionState` can render inline, so a
 * failure shows in the UI instead of crashing to the nearest error boundary.
 */
export async function createTagFormAction(
	_prevState: TagFormActionState,
	formData: FormData,
): Promise<TagFormActionState> {
	try {
		await createTagAction(formData);
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "Failed to create tag.",
		};
	}
	return null;
}

/** Same bridging as `createTagFormAction`, for the per-row edit form. */
export async function updateTagFormAction(
	_prevState: TagFormActionState,
	formData: FormData,
): Promise<TagFormActionState> {
	try {
		await updateTagAction(formData);
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "Failed to update tag.",
		};
	}
	return null;
}

/**
 * Bound per-row (via `.bind(null, tag.id)`, done client-side in
 * `TagsManager`) to `ConfirmDelete`'s `deleteAction` prop. `deleteTagAction`
 * expects a `FormData` containing `tagId` (not a plain id argument like
 * `deletePostAction`), so this builds that `FormData` itself.
 *
 * `ConfirmDelete` has no error-state channel (its `deleteAction` prop is
 * typed `Promise<void>`, and its dialog closes optimistically on submit),
 * so a thrown error is caught and logged here rather than left to crash to
 * the nearest error boundary. The realistic failure mode (the tag no longer
 * existing) is already guarded against in the UI via `buttonDisabled` when
 * the tag has posts.
 */
export async function deleteTagById(tagId: string) {
	try {
		const formData = new FormData();
		formData.set("tagId", tagId);
		await deleteTagAction(formData);
	} catch (error) {
		console.error("Failed to delete tag:", error);
	}
}
