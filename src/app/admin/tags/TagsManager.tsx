"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import ConfirmDelete from "@/components/ConfirmDelete";
import type { TagFormActionState } from "./actions";
import styles from "./TagsManager.module.css";

interface AdminTagSummary {
	id: string;
	name: string;
	slug: string;
	_count: { posts: number };
}

interface TagsManagerProps {
	tags: AdminTagSummary[];
	createAction: (
		prevState: TagFormActionState,
		formData: FormData,
	) => Promise<TagFormActionState>;
	updateAction: (
		prevState: TagFormActionState,
		formData: FormData,
	) => Promise<TagFormActionState>;
	deleteAction: (tagId: string) => Promise<void>;
}

export default function TagsManager({
	tags,
	createAction,
	updateAction,
	deleteAction,
}: TagsManagerProps) {
	const [editingTagId, setEditingTagId] = useState<string | null>(null);

	const [createState, createFormAction, createPending] = useActionState<
		TagFormActionState,
		FormData
	>(createAction, null);

	// A single shared `useActionState` instance backs whichever row's edit
	// form is currently rendered - only one row is ever in edit mode at a
	// time (gated by `editingTagId`).
	const [updateState, updateFormAction, updatePending] = useActionState<
		TagFormActionState,
		FormData
	>(updateAction, null);

	const wasUpdatePending = useRef(false);
	useEffect(() => {
		if (wasUpdatePending.current && !updatePending && !updateState?.error) {
			setEditingTagId(null);
		}
		wasUpdatePending.current = updatePending;
	}, [updatePending, updateState]);

	return (
		<div className="piko-vstack">
			<section className={styles.card}>
				<h2>Create New Tag</h2>
				{createState?.error && (
					<p data-state="error" className="piko-state__box">
						{createState.error}
					</p>
				)}
				<form action={createFormAction} className={styles.createForm}>
					<label className={styles.formGroup}>
						<span>Tag Name</span>
						<input
							type="text"
							name="name"
							placeholder="Enter tag name"
							required
						/>
					</label>
					<button
						type="submit"
						className="piko-button--primary"
						disabled={createPending}
					>
						{createPending ? "Creating..." : "Create Tag"}
					</button>
				</form>
			</section>

			<section className={styles.card}>
				<h2>Existing Tags ({tags.length})</h2>

				{updateState?.error && (
					<p data-state="error" className="piko-state__box">
						{updateState.error}
					</p>
				)}

				{tags.length === 0 ? (
					<p>No tags exist yet. Create your first tag above.</p>
				) : (
					<div className={styles.tagsList}>
						{tags.map((tag) => (
							<div key={tag.id} className={styles.tagItem}>
								<div className={styles.tagInfo}>
									<span className={styles.tagName}>{tag.name}</span>
									<span className={styles.tagCount}>
										{tag._count.posts}{" "}
										{tag._count.posts === 1 ? "post" : "posts"}
									</span>
								</div>

								{editingTagId === tag.id ? (
									<form
										action={updateFormAction}
										className={styles.editControls}
									>
										<input type="hidden" name="tagId" value={tag.id} />
										<input
											type="text"
											name="name"
											defaultValue={tag.name}
											required
										/>
										<button
											type="submit"
											className="piko-button--primary"
											disabled={updatePending}
										>
											{updatePending ? "Saving..." : "Save"}
										</button>
										<button
											type="button"
											onClick={() => setEditingTagId(null)}
											disabled={updatePending}
										>
											Cancel
										</button>
									</form>
								) : (
									<div className={styles.tagActions}>
										<button
											type="button"
											onClick={() => setEditingTagId(tag.id)}
										>
											Edit
										</button>
										<ConfirmDelete
											deleteAction={deleteAction.bind(null, tag.id)}
											message={`Delete "${tag.name}"?`}
											buttonLabel="Delete"
											buttonTitle={
												tag._count.posts > 0
													? "Cannot delete tag with posts"
													: "Delete tag"
											}
											buttonDisabled={tag._count.posts > 0}
										/>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
