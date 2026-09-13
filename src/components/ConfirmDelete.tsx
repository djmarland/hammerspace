"use client";

import { useRef } from "react";
import type { SyntheticEvent } from "react";
import Modal from "@/components/Molecules/Modal/Modal";
import styles from "./ConfirmDelete.module.css";

interface ConfirmDeleteProps {
	message?: string;
	disabled?: boolean;

	/**
	 * A Server Action bound to whatever it needs to identify the item to
	 * delete (e.g. `deletePostAction.bind(null, postId)`), supplied by the
	 * page. Used directly as the confirmation `<form>`'s `action`.
	 */
	deleteAction: (formData: FormData) => Promise<void>;

	// trigger button props
	buttonLabel?: string;
	buttonTitle?: string;
	buttonDisabled?: boolean;

	onCancel?: () => void;
	onSubmit?: () => void;
	onClose?: () => void;
}

export default function ConfirmDelete({
	message = "Delete this item?",
	disabled = false,
	deleteAction,
	buttonLabel = "Delete",
	buttonTitle,
	buttonDisabled = false,
	onCancel,
	onSubmit,
	onClose,
}: ConfirmDeleteProps) {
	const dialogRef = useRef<HTMLDialogElement | null>(null);

	function openDialog() {
		if (buttonDisabled) return;
		dialogRef.current?.showModal();
	}

	function handleCancel(event: SyntheticEvent) {
		event.preventDefault();
		onCancel?.();
		dialogRef.current?.close();
	}

	function handleSubmit() {
		onSubmit?.();
		// close after submit to keep UI consistent; navigation may occur
		dialogRef.current?.close();
	}

	return (
		<>
			<button
				type="button"
				className="piko-button--danger"
				title={buttonTitle}
				disabled={buttonDisabled || disabled}
				onClick={openDialog}
			>
				{buttonLabel}
			</button>

			<Modal
				ref={dialogRef}
				title="Confirm delete"
				onCancel={handleCancel}
				onClose={onClose}
				actions={
					<>
						<form
							action={deleteAction}
							onSubmit={handleSubmit}
							className={styles.deleteForm}
						>
							<button
								type="submit"
								className="piko-button--danger"
								disabled={disabled}
							>
								Yes, Delete
							</button>
						</form>
						<button
							type="button"
							className="piko-button"
							onClick={handleCancel}
							disabled={disabled}
						>
							Cancel
						</button>
					</>
				}
			>
				<p>{message}</p>
			</Modal>
		</>
	);
}
