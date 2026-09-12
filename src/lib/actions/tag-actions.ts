"use server";

import {
	createTagAction as createTag,
	deleteTagAction as deleteTag,
	updateTagAction as updateTag,
} from "@/lib/tags";

/**
 * Server Actions for tag mutations. These are thin wrappers around the
 * framework-agnostic implementations in `tags.ts` (which already self-check
 * `requireAdmin()` and call `revalidatePath()` on success) — the wrapping is
 * required because only async functions declared directly in a
 * `"use server"` module are treated by Next.js as Server Actions; a plain
 * `export { x } from "..."` re-export would not be.
 */

export async function createTagAction(formData: FormData) {
	return createTag(formData);
}

export async function deleteTagAction(formData: FormData) {
	return deleteTag(formData);
}

export async function updateTagAction(formData: FormData) {
	return updateTag(formData);
}
