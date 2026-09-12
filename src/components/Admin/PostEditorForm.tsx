"use client";

import { useActionState, useState } from "react";
import type { ChangeEvent } from "react";
import { cx } from "@/components/cx";
import AssetLibraryModal from "@/components/Admin/AssetLibrary/AssetLibraryModal";
import type { SelectedAsset } from "@/components/Admin/AssetLibrary/AssetLibraryModal";
import MarkdownContent from "@/components/Blog/MarkdownContent";
import type { PostFormValues } from "@/lib/post-form";
import styles from "./PostEditorForm.module.css";

/**
 * Shape returned by the Server Action that backs this form. The actual
 * implementation is passed in via the `formAction` prop - this component
 * only needs to know the shape of the state it renders.
 */
export type PostFormActionState = {
	errors?: Record<string, string[]>;
	message?: string;
} | null;

interface PostEditorFormProps {
	formAction: (
		prevState: PostFormActionState,
		formData: FormData,
	) => Promise<PostFormActionState>;
	submitLabel: string;
	initialValues?: Partial<PostFormValues>;
	initialCoverAsset?: SelectedAsset | null;
	mode: "create" | "edit";
}

// `mode` (in PostEditorFormProps) doesn't currently change any markup in
// this component - callers vary `submitLabel` instead. It's kept in the
// props contract for parity with the create/edit routes, but isn't
// destructured below since nothing here reads it.
export default function PostEditorForm({
	formAction,
	submitLabel,
	initialValues,
	initialCoverAsset,
}: PostEditorFormProps) {
	const [state, action, pending] = useActionState<
		PostFormActionState,
		FormData
	>(formAction, null);

	const [previewContent, setPreviewContent] = useState(
		initialValues?.content || "",
	);

	const [coverAsset, setCoverAsset] = useState<SelectedAsset | null>(
		initialCoverAsset ?? null,
	);

	const allErrors = state?.errors ? Object.values(state.errors).flat() : [];

	function handleContentInput(event: ChangeEvent<HTMLTextAreaElement>) {
		setPreviewContent(event.currentTarget.value);
	}

	return (
		<form className={styles.form} action={action}>
			<div className="piko-page-container">
				{state?.message ? (
					<p className={styles.error}>{state.message}</p>
				) : allErrors.length > 0 ? (
					<p className={styles.error}>Please fix the highlighted fields.</p>
				) : null}

				<label className={styles.field}>
					<span>Title</span>
					<input
						type="text"
						name="title"
						required
						defaultValue={initialValues?.title}
						aria-invalid={state?.errors?.title ? "true" : "false"}
					/>
					{state?.errors?.title && (
						<span className={styles.fieldError}>{state.errors.title[0]}</span>
					)}
				</label>

				<label className={styles.field}>
					<span>Slug</span>
					<input
						type="text"
						name="slug"
						required
						defaultValue={initialValues?.slug}
						aria-invalid={state?.errors?.slug ? "true" : "false"}
					/>
					{state?.errors?.slug && (
						<span className={styles.fieldError}>{state.errors.slug[0]}</span>
					)}
				</label>
			</div>
			<div className={cx(styles.editor, "piko-vstack--small")}>
				<label htmlFor="content">Content (Markdown)</label>
				{state?.errors?.content && (
					<p className={styles.fieldError}>{state.errors.content[0]}</p>
				)}
				<div className={styles.editorGrid}>
					<textarea
						id="content"
						name="content"
						rows={14}
						required
						defaultValue={initialValues?.content}
						onChange={handleContentInput}
						aria-invalid={state?.errors?.content ? "true" : "false"}
					/>
					<section className={styles.preview} aria-label="Markdown preview">
						<div className="piko-prose">
							{previewContent ? (
								<MarkdownContent content={previewContent} />
							) : (
								<p>Start writing to see a live preview.</p>
							)}
						</div>
					</section>
				</div>
			</div>

			<div className="piko-page-container">
				<div className={styles.field}>
					<span>Cover image</span>
					<input
						type="hidden"
						name="coverAssetId"
						value={coverAsset?.id || ""}
					/>
					{coverAsset && (
						<img
							src={coverAsset.url}
							alt={coverAsset.alt}
							className={styles.coverPreview}
						/>
					)}
					<div className="piko-hstack">
						<AssetLibraryModal
							triggerLabel={
								coverAsset ? "Change cover image" : "Choose cover image"
							}
							filter="image"
							onSelect={setCoverAsset}
						/>
						{coverAsset && (
							<button
								type="button"
								className="piko-button"
								onClick={() => setCoverAsset(null)}
							>
								Remove
							</button>
						)}
					</div>
					{state?.errors?.coverAssetId && (
						<span className={styles.fieldError}>
							{state.errors.coverAssetId[0]}
						</span>
					)}
				</div>

				<div className={styles.actions}>
					<div className={cx("piko-page-container", styles.actionsInner)}>
						<button
							type="submit"
							className={styles.submitButton}
							disabled={pending}
						>
							{pending ? "Saving..." : submitLabel}
						</button>
					</div>
				</div>
			</div>
		</form>
	);
}
