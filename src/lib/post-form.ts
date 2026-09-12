import { z } from "zod";
import { isValidDateTimeLocal } from "@/lib/temporal";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Single source of truth for post form validation, run inside the Server
 * Actions that create/update/publish posts (see
 * src/lib/actions/post-actions.ts and the admin route action adapters).
 */
export const postSchema = z.object({
	title: z.string().trim().min(1, "Title is required."),
	slug: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, "Slug is required.")
		.regex(
			slugRegex,
			"Slug must use lowercase letters, numbers, and hyphens only.",
		),
	content: z.string().trim().min(1, "Content is required."),
	// References an existing Asset's id, chosen via the AssetLibraryModal
	// picker in PostEditorForm. Existence is checked server-side, not here.
	coverAssetId: z.string().trim().optional().default(""),
});

export type PostFormValues = z.infer<typeof postSchema>;

/**
 * Schema for the dedicated publish screen, where an admin chooses the
 * publication date/time (and optionally adjusts the slug) for a post,
 * separate from the main editor form.
 */
export const publishSchema = z
	.object({
		slug: z
			.string()
			.trim()
			.toLowerCase()
			.min(1, "Slug is required.")
			.regex(
				slugRegex,
				"Slug must use lowercase letters, numbers, and hyphens only.",
			),
		publishedAt: z.string().trim().min(1, "Choose a publish date and time."),
	})
	.superRefine((values, ctx) => {
		if (!isValidDateTimeLocal(values.publishedAt)) {
			ctx.addIssue({
				code: "custom",
				path: ["publishedAt"],
				message: "Enter a valid publication date and time.",
			});
		}
	});

export type PublishFormValues = z.infer<typeof publishSchema>;
