"use server";

import {
	createPostFromValues,
	deletePostAction as deletePost,
	publishPostAction as publishPost,
	unpublishPostAction as unpublishPost,
	updatePostFromValues,
} from "@/lib/post-form-actions";
import type { PostFormValues, PublishFormValues } from "@/lib/post-form";

/**
 * Server Actions for post mutations. These are thin wrappers around the
 * framework-agnostic implementations in `post-form-actions.ts` (which
 * already self-check `ensureAdminSession()` and call `revalidatePath()` on
 * success) — the wrapping is required because only async functions declared
 * directly in a `"use server"` module are treated by Next.js as Server
 * Actions; a plain `export { x } from "..."` re-export would not be.
 */

export async function createPostAction(values: PostFormValues) {
	return createPostFromValues(values);
}

export async function updatePostAction(postId: string, values: PostFormValues) {
	return updatePostFromValues(postId, values);
}

export async function publishPostAction(
	postId: string,
	values: PublishFormValues,
) {
	return publishPost(postId, values);
}

export async function unpublishPostAction(postId: string) {
	return unpublishPost(postId);
}

export async function deletePostAction(id: string) {
	return deletePost(id);
}
