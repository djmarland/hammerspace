"use client";

import { useActionState, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import {
	formatDateTimeLocalValue,
	formatSlugDateSuffix,
	parseDateTimeLocalAsDate,
} from "@/lib/temporal";
import type { PublishFormActionState } from "./actions";
import styles from "./PublishForm.module.css";

interface PublishFormProps {
	formAction: (
		prevState: PublishFormActionState,
		formData: FormData,
	) => Promise<PublishFormActionState>;
	postId: string;
	initialSlug: string;
	initialPublishedAt: string;
	isFirstPublish: boolean;
}

export default function PublishForm({
	formAction,
	postId,
	initialSlug,
	initialPublishedAt,
	isFirstPublish,
}: PublishFormProps) {
	const [state, action, pending] = useActionState<
		PublishFormActionState,
		FormData
	>(formAction, null);

	const [slug, setSlug] = useState(initialSlug);
	const [publishedAt, setPublishedAt] = useState(initialPublishedAt);

	// The "-mm-yyyy" suffix is only appended the first time a post is
	// published, so only preview it while the post is still a Draft.
	const previewSlug = useMemo(() => {
		if (!isFirstPublish) {
			return slug;
		}
		const publishDate = parseDateTimeLocalAsDate(publishedAt);
		if (!publishDate) {
			return slug;
		}
		return `${slug}${formatSlugDateSuffix(publishDate)}`;
	}, [slug, publishedAt, isFirstPublish]);

	function setToNow() {
		setPublishedAt(formatDateTimeLocalValue(new Date()));
	}

	return (
		<form action={action} className="piko-vstack">
			{state?.message && (
				<p data-state="error" className="piko-state__box">
					{state.message}
				</p>
			)}

			<label className={styles.field}>
				<span>Slug</span>
				<input
					type="text"
					name="slug"
					required
					value={slug}
					onChange={(event: ChangeEvent<HTMLInputElement>) =>
						setSlug(event.currentTarget.value)
					}
					aria-invalid={state?.errors?.slug ? "true" : "false"}
				/>
				{state?.errors?.slug && (
					<span data-state="error" className="piko-state__text">
						{state.errors.slug[0]}
					</span>
				)}
			</label>
			<code>{previewSlug}</code>

			<label className={styles.field}>
				<span>Publish at</span>
				<div className="piko-hstack">
					<input
						type="datetime-local"
						name="publishedAt"
						value={publishedAt}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							setPublishedAt(event.currentTarget.value)
						}
						aria-invalid={state?.errors?.publishedAt ? "true" : "false"}
					/>
					<button type="button" onClick={setToNow}>
						Set to now
					</button>
				</div>
				{state?.errors?.publishedAt && (
					<span data-state="error" className="piko-state__text">
						{state.errors.publishedAt[0]}
					</span>
				)}
			</label>

			<div className="piko-hstack">
				<button
					className="piko-button--primary"
					type="submit"
					disabled={pending}
				>
					{pending ? "Publishing..." : "Publish"}
				</button>
				<Link className="piko-button" href={`/admin/posts/${postId}/edit`}>
					Cancel
				</Link>
			</div>
		</form>
	);
}
