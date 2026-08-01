"use client";

import { useActionState } from "react";
import { initialPostFormState, type PostFormState } from "@/lib/post-form";
import styles from "./PostEditorForm.module.css";

interface PostEditorFormProps {
	action: (
		state: PostFormState | undefined,
		formData: FormData,
	) => Promise<PostFormState>;
	submitLabel: string;
	initialValues?: Partial<PostFormState["values"]>;
}

export default function PostEditorForm({
	action,
	submitLabel,
	initialValues,
}: PostEditorFormProps) {
	const [state, formAction, pending] = useActionState(action, {
		...initialPostFormState,
		values: {
			...initialPostFormState.values,
			...initialValues,
		},
	});

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
					aria-invalid={state.fieldErrors.content ? "true" : "false"}
				/>
				{state.fieldErrors.content && (
					<span className={styles.fieldError}>{state.fieldErrors.content}</span>
				)}
			</label>

			<label className={styles.checkboxField}>
				<input
					type="checkbox"
					name="published"
					defaultChecked={state.values.published}
				/>
				<span>Published</span>
			</label>

			<button type="submit" className={styles.submitButton} disabled={pending}>
				{pending ? "Saving..." : submitLabel}
			</button>
		</form>
	);
}
