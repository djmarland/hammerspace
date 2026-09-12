import type { ZodError } from "zod";
import { postSchema, type PostFormValues } from "@/lib/post-form";

/**
 * Shared helpers for the two Server Action adapters (`new/actions.ts` and
 * `[id]/edit/actions.ts`) that bridge `PostEditorForm`'s `useActionState`
 * contract (a `(prevState, formData) => Promise<PostFormActionState>`
 * function operating on a raw `FormData`) onto `createPostAction` /
 * `updatePostAction` in `@/lib/actions/post-actions.ts`, which expect an
 * already-validated `PostFormValues` object instead.
 */

function getString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

export function parsePostFormData(formData: FormData) {
	return postSchema.safeParse({
		title: getString(formData, "title"),
		slug: getString(formData, "slug"),
		content: getString(formData, "content"),
		coverAssetId: getString(formData, "coverAssetId"),
	});
}

export function fieldErrorsFrom(
	error: ZodError<PostFormValues>,
): Record<string, string[]> {
	const { fieldErrors } = error.flatten();
	const result: Record<string, string[]> = {};
	for (const [key, value] of Object.entries(fieldErrors)) {
		if (value) {
			result[key] = value;
		}
	}
	return result;
}

export function errorMessage(error: unknown, fallback: string): string {
	return error instanceof Error ? error.message : fallback;
}
