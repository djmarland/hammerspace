"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { cx } from "@/components/cx";
import AssetLibraryModal from "@/components/Admin/AssetLibrary/AssetLibraryModal";
import type { SelectedAsset } from "@/components/Admin/AssetLibrary/AssetLibraryModal";
import MarkdownContent from "@/components/Blog/MarkdownContent";
import { useToast } from "@/components/Molecules/Toast/ToastProvider";
import type { PostFormValues } from "@/lib/post-form";
import { usePostDraft } from "./usePostDraft";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";
import styles from "./PostEditorForm.module.css";

/**
 * Shape returned by the Server Action that backs this form. The actual
 * implementation is passed in via the `formAction` prop - this component
 * only needs to know the shape of the state it renders.
 */
export type PostFormActionState = {
	errors?: Record<string, string[]>;
	message?: string;
	/** Set when an update succeeded without leaving the page. */
	saved?: boolean;
} | null;

interface PostEditorFormProps {
	formAction: (
		prevState: PostFormActionState,
		formData: FormData,
	) => Promise<PostFormActionState>;
	submitLabel: string;
	initialValues?: Partial<PostFormValues>;
	initialCoverAsset?: SelectedAsset | null;
	/** localStorage key under which the work-in-progress draft is kept. */
	draftKey: string;
	mode: "create" | "edit";
}

const PREVIEW_DELAY_MS = 250;
const DRAFT_SAVE_DELAY_MS = 500;

// `mode` (in PostEditorFormProps) doesn't currently change any markup in
// this component - callers vary `submitLabel` instead. It's kept in the
// props contract for parity with the create/edit routes, but isn't
// destructured below since nothing here reads it.
export default function PostEditorForm({
	formAction,
	submitLabel,
	initialValues,
	initialCoverAsset,
	draftKey,
}: PostEditorFormProps) {
	// Set while a submit is in flight or has succeeded; cleared by any edit.
	// Create redirects away on success without ever returning a result, so
	// the draft is also cleared on unmount when this is still set.
	const savedRef = useRef(false);
	const {
		stored: storedDraft,
		save: saveDraft,
		clear: clearDraft,
	} = usePostDraft(draftKey);

	const [state, action, pending] = useActionState<
		PostFormActionState,
		FormData
	>(async (prevState, formData) => {
		savedRef.current = true;
		const result = await formAction(prevState, formData);
		if (result?.errors || result?.message) savedRef.current = false;
		if (result?.saved) clearDraft();
		return result;
	}, null);

	const [title, setTitle] = useState(initialValues?.title ?? "");
	const [slug, setSlug] = useState(initialValues?.slug ?? "");
	const [summary, setSummary] = useState(initialValues?.summary ?? "");
	const [content, setContent] = useState(initialValues?.content ?? "");
	const [coverAsset, setCoverAsset] = useState<SelectedAsset | null>(
		initialCoverAsset ?? null,
	);

	// The preview re-renders the whole Markdown document, so it trails the
	// textarea slightly rather than updating on every keystroke.
	const [previewContent, setPreviewContent] = useState(content);
	useEffect(() => {
		const timeout = setTimeout(
			() => setPreviewContent(content),
			PREVIEW_DELAY_MS,
		);
		return () => clearTimeout(timeout);
	}, [content]);

	// Edits count as unsaved only until the next action result arrives, so a
	// successful save clears the warning without resetting state in an effect.
	const [editedAt, setEditedAt] = useState<{ state: typeof state } | null>(
		null,
	);
	const isDirty = editedAt !== null && editedAt.state === state;
	const markDirty = () => {
		savedRef.current = false;
		setEditedAt((prev) => (prev?.state === state ? prev : { state }));
	};
	useUnsavedChangesWarning(isDirty);

	// A draft from an earlier session is offered back until the user answers;
	// drafts that match what's already saved aren't worth offering.
	const [draftResolved, setDraftResolved] = useState(false);
	const pendingDraft =
		!draftResolved &&
		storedDraft &&
		(storedDraft.title !== (initialValues?.title ?? "") ||
			storedDraft.slug !== (initialValues?.slug ?? "") ||
			storedDraft.summary !== (initialValues?.summary ?? "") ||
			storedDraft.content !== (initialValues?.content ?? "") ||
			(storedDraft.coverAsset?.id ?? "") !== (initialCoverAsset?.id ?? ""))
			? storedDraft
			: null;

	function restoreDraft() {
		if (!pendingDraft) return;
		setTitle(pendingDraft.title);
		setSlug(pendingDraft.slug);
		setSummary(pendingDraft.summary);
		setContent(pendingDraft.content);
		setPreviewContent(pendingDraft.content);
		setCoverAsset(pendingDraft.coverAsset);
		markDirty();
		setDraftResolved(true);
	}

	function discardDraft() {
		clearDraft();
		setDraftResolved(true);
	}

	// Editing instead of answering the prompt discards the old draft; the
	// edits are then stored as the new one.
	function handleEdit() {
		if (pendingDraft) discardDraft();
		markDirty();
	}

	// Don't overwrite the stored draft while it's still waiting to be answered.
	useEffect(() => {
		if (!isDirty || pendingDraft) return;
		const timeout = setTimeout(
			() => saveDraft({ title, slug, summary, content, coverAsset }),
			DRAFT_SAVE_DELAY_MS,
		);
		return () => clearTimeout(timeout);
	}, [
		isDirty,
		pendingDraft,
		title,
		slug,
		summary,
		content,
		coverAsset,
		saveDraft,
	]);

	useEffect(
		() => () => {
			if (savedRef.current) clearDraft();
		},
		[clearDraft],
	);

	const toast = useToast();

	useEffect(() => {
		if (!state) return;
		if (state.saved) {
			toast.success("Post saved");
		} else if (state.message) {
			toast.error(state.message);
		} else if (state.errors) {
			toast.error("Please fix the highlighted fields.");
		}
	}, [state, toast]);

	return (
		<form className={styles.form} action={action}>
			{pendingDraft && (
				<div className="piko-page-container">
					<div
						data-state="warning"
						className="piko-state__box piko-vstack"
						role="region"
						aria-label="Unsaved draft"
					>
						<h2 className="piko-t-h2">Unsaved draft found</h2>
						<p>
							You have unsaved work from{" "}
							{new Date(pendingDraft.savedAt).toLocaleString()}. Would you like
							to continue where you left off?
						</p>
						<div className="piko-hstack">
							<button
								type="button"
								className="piko-button"
								onClick={restoreDraft}
							>
								Continue editing
							</button>
							<button
								type="button"
								className="piko-button"
								onClick={discardDraft}
							>
								Discard
							</button>
						</div>
					</div>
				</div>
			)}
			<div className="piko-page-container">
				<label className={styles.field}>
					<span>Title</span>
					<input
						type="text"
						name="title"
						required
						value={title}
						onChange={(event) => {
							setTitle(event.currentTarget.value);
							handleEdit();
						}}
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
						value={slug}
						onChange={(event) => {
							setSlug(event.currentTarget.value);
							handleEdit();
						}}
						aria-invalid={state?.errors?.slug ? "true" : "false"}
					/>
					{state?.errors?.slug && (
						<span className={styles.fieldError}>{state.errors.slug[0]}</span>
					)}
				</label>

				<label className={styles.field}>
					<span>Summary</span>
					<textarea
						name="summary"
						rows={3}
						required
						value={summary}
						onChange={(event) => {
							setSummary(event.currentTarget.value);
							handleEdit();
						}}
						aria-describedby="summary-help"
						aria-invalid={state?.errors?.summary ? "true" : "false"}
					/>
					<span id="summary-help" className={styles.helpText}>
						Used for search results and link previews. Aim for under 160
						characters ({summary.trim().length} so far).
					</span>
					{state?.errors?.summary && (
						<span className={styles.fieldError}>{state.errors.summary[0]}</span>
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
						value={content}
						onChange={(event) => {
							setContent(event.currentTarget.value);
							handleEdit();
						}}
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
						<div className={styles.coverPreview}>
							<Image
								src={coverAsset.url}
								alt={coverAsset.alt}
								fill
								sizes="320px"
								className={styles.coverPreviewImage}
							/>
						</div>
					)}
					<div className="piko-hstack">
						<AssetLibraryModal
							triggerLabel={
								coverAsset ? "Change cover image" : "Choose cover image"
							}
							filter="image"
							onSelect={(asset) => {
								setCoverAsset(asset);
								handleEdit();
							}}
						/>
						{coverAsset && (
							<button
								type="button"
								className="piko-button"
								onClick={() => {
									setCoverAsset(null);
									handleEdit();
								}}
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
							className="piko-button--primary"
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
