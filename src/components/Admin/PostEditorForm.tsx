"use client";

import { useActionState, useState } from "react";
import { initialPostFormState, type PostFormState } from "@/lib/post-form";
import { CMS_TIME_ZONE } from "@/lib/temporal";
import { MarkdownContent } from "@/components/Blog/MarkdownContent";
import styles from "./PostEditorForm.module.css";

interface PostEditorFormProps {
	action: (
		state: PostFormState | undefined,
		formData: FormData,
	) => Promise<PostFormState>;
	submitLabel: string;
	initialValues?: Partial<PostFormState["values"]>;
	tags: { id: string; name: string }[];
}

export default function PostEditorForm({
	action,
	submitLabel,
	initialValues,
	tags,
}: PostEditorFormProps) {
	const [state, formAction, pending] = useActionState(action, {
		...initialPostFormState,
		values: {
			...initialPostFormState.values,
			...initialValues,
		},
	});
	const [previewContent, setPreviewContent] = useState(state.values.content);


	return (
		<form action={formAction} className={styles.form}>
			{state.formError && <p className={styles.error}>{state.formError}</p>}

			<label className={styles.field}>
				<span>Title</span>
				<input
					type="text"
					name="title"
					required
					defaultValue={state.values.title}
					aria-invalid={state.fieldErrors.title ? "true" : "false"}
				/>
				{state.fieldErrors.title && (
					<span className={styles.fieldError}>{state.fieldErrors.title}</span>
				)}
			</label>

			{tags.length > 0 && (
				<fieldset className={styles.fieldset}>
					<legend>Tags</legend>
					<div className={styles.tagGrid}>
						{tags.map((tag) => (
							<label key={tag.id} className={styles.checkboxField}>
								<input
									type="checkbox"
									name="tagIds"
									value={tag.id}
									defaultChecked={state.values.tagIds.includes(tag.id)}
								/>
								<span>{tag.name}</span>
							</label>
						))}
					</div>
				</fieldset>
			)}

			<label className={styles.field}>
				<span>Slug</span>
				<input
					type="text"
					name="slug"
					required
					defaultValue={state.values.slug}
					aria-invalid={state.fieldErrors.slug ? "true" : "false"}
				/>
				{state.fieldErrors.slug && (
					<span className={styles.fieldError}>{state.fieldErrors.slug}</span>
				)}
				<p className={styles.helpText}>
					Canonical URL is derived automatically from NEXT_PUBLIC_SITE_URL and this slug.
				</p>
			</label>

			<label className={styles.field}>
				<span>Excerpt</span>
				<textarea name="excerpt" rows={3} defaultValue={state.values.excerpt} />
			</label>

			<label className={styles.field}>
				<span>Content (Markdown)</span>
				<textarea
					name="content"
					rows={14}
					required
					defaultValue={state.values.content}
					onInput={(event) => setPreviewContent(event.currentTarget.value)}
					aria-invalid={state.fieldErrors.content ? "true" : "false"}
				/>
				{state.fieldErrors.content && (
					<span className={styles.fieldError}>{state.fieldErrors.content}</span>
				)}
			</label>

			<section className={styles.preview} aria-label="Markdown preview">
				<div className={styles.previewHeader}>
					<h2>Preview</h2>
					<p>Rendered with the same MarkdownContent component used on public posts.</p>
				</div>
				<div className={styles.previewBody}>
					{previewContent ? (
						<MarkdownContent content={previewContent} />
					) : (
						<p>Start writing to see a live preview.</p>
					)}
				</div>
			</section>

			<label className={styles.field}>
				<span>Status</span>
				<select name="status" defaultValue={state.values.status}>
					<option value="DRAFT">Draft</option>
					<option value="SCHEDULED">Scheduled</option>
					<option value="PUBLISHED">Published</option>
					<option value="ARCHIVED">Archived</option>
				</select>
				<p className={styles.helpText}>
					Drafts remain available only on their direct blog URL. Archive a post to hide it completely.
				</p>
			</label>

			<label className={styles.field}>
				<span>Schedule for</span>
				<input
					type="datetime-local"
					name="scheduledFor"
					defaultValue={state.values.scheduledFor}
					aria-invalid={state.fieldErrors.scheduledFor ? "true" : "false"}
				/>
				<p className={styles.helpText}>
					Stored using Temporal and interpreted as {CMS_TIME_ZONE}.
				</p>
				{state.fieldErrors.scheduledFor && (
					<span className={styles.fieldError}>{state.fieldErrors.scheduledFor}</span>
				)}
			</label>

			<label className={styles.field}>
				<span>Cover image URL</span>
				<input type="url" name="coverImageUrl" defaultValue={state.values.coverImageUrl} />
				<p className={styles.helpText}>Only absolute external image URLs are supported.</p>
			</label>

			<label className={styles.field}>
				<span>Cover image alt text</span>
				<input type="text" name="coverImageAlt" defaultValue={state.values.coverImageAlt} />
				{state.fieldErrors.coverImageAlt && (
					<span className={styles.fieldError}>{state.fieldErrors.coverImageAlt}</span>
				)}
			</label>

			<button type="submit" className={styles.submitButton} disabled={pending}>
				{pending ? "Saving..." : submitLabel}
			</button>
		</form>
	);
}
