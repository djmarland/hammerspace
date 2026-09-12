"use client";

import ConfirmDelete from "@/components/ConfirmDelete";

interface DangerZoneProps {
	isPublished: boolean;
	unpublishAction: (formData: FormData) => Promise<void>;
	deleteAction: (formData: FormData) => Promise<void>;
}

export default function DangerZone({
	isPublished,
	unpublishAction,
	deleteAction,
}: DangerZoneProps) {
	return (
		<section className="piko-page-container piko-vstack">
			{isPublished && (
				<div data-state="warning" className="piko-state__box  piko-vstack">
					<h2 className="piko-t-h2">Unpublish Post</h2>
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

			<div data-state="error" className="piko-state__box piko-vstack">
				<h2 className="piko-t-h2">Delete Post</h2>
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
