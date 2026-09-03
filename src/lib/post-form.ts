import { z } from "zod";
import { isValidDateTimeLocal } from "@/lib/temporal";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isAbsoluteHttpUrl(value: string): boolean {
	if (!value) return true;
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:";
	} catch {
		return false;
	}
}

/**
 * Single source of truth for post form validation. Runs identically on the
 * server (in +page.server.ts actions via superValidate) and on the client
 * (in PostEditorForm.svelte via superForm's client-side validator), so the
 * user gets the same rules and messages in both places.
 */
export const postSchema = z
	.object({
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
		excerpt: z.string().trim().optional().default(""),
		content: z.string().trim().min(1, "Content is required."),
		coverImageUrl: z.string().trim().optional().default(""),
		coverImageAlt: z.string().trim().optional().default(""),
		tagIds: z.array(z.string()).optional().default([]),
	})
	.superRefine((values, ctx) => {
		if (!isAbsoluteHttpUrl(values.coverImageUrl)) {
			ctx.addIssue({
				code: "custom",
				path: ["coverImageUrl"],
				message: "Use an absolute http or https URL.",
			});
		} else if (values.coverImageUrl && !values.coverImageAlt) {
			ctx.addIssue({
				code: "custom",
				path: ["coverImageAlt"],
				message: "Describe the cover image for screen readers.",
			});
		}
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
