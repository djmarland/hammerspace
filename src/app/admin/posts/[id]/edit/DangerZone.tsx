"use client";

import ConfirmDelete from "@/components/ConfirmDelete";
import styles from "./DangerZone.module.css";

interface DangerZoneProps {
	isPublished: boolean;
	unpublishAction: (formData: FormData) => Promise<void>;
	deleteAction: (formData: FormData) => Promise<void>;
}

/**
 * Renders the "Unpublish" (only when currently published) and "Delete"
 * confirmation controls for the edit page. Reuses the already-built
 * `ConfirmDelete` dialog component for both - it isn't delete-specific,
 * just a generic "confirm, then submit a bound Server Action" dialog.
 */
export default function DangerZone({
	isPublished,
	unpublishAction,
	deleteAction,
}: DangerZoneProps) {
	return (
		<section className="piko-page-container piko-vstack">
			{isPublished && (
				<div className={styles.warnCard}>
					<h3>Unpublish Post</h3>
					<p>
						Move this post back to Draft. It will no longer be visible on the
						public site.
					</p>
					<ConfirmDelete
						deleteAction={unpublishAction}
						message="Are you sure you want to unpublish this post?"
						buttonLabel="Unpublish"
					/>
				</div>
			)}

			<div className={styles.dangerZone}>
				<h2>Danger Zone</h2>
				<p>These actions are permanent and cannot be undone.</p>
				<ConfirmDelete
					deleteAction={deleteAction}
					message="Are you absolutely sure you want to delete this post permanently?"
					buttonLabel="Delete"
				/>
			</div>
		</section>
	);
}
