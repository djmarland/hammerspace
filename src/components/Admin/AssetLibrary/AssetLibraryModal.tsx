"use client";

import {
	useActionState,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import { cx } from "@/components/cx";
import Image from "next/image";
import ConfirmDelete from "@/components/ConfirmDelete";
import Modal from "@/components/Molecules/Modal/Modal";
import { useToast } from "@/components/Molecules/Toast/ToastProvider";
import {
	createAssetAction,
	deleteAssetAction,
	listAssetsAction,
	updateAssetMetaAction,
} from "@/lib/actions/asset-actions";
import type { AssetSummary } from "@/lib/assets";
import styles from "./AssetLibraryModal.module.css";

export interface SelectedAsset {
	id: string;
	url: string;
	alt: string;
	title: string;
}

interface AssetLibraryModalProps {
	triggerLabel?: string;
	triggerClassName?: string;
	/** Restrict the gallery to image assets - used by the post cover picker. */
	filter?: "image";
	/**
	 * When provided, clicking an asset calls this and closes the dialog
	 * (picker mode) instead of copying a markdown snippet to the clipboard
	 * (browse mode, the nav's default usage).
	 */
	onSelect?: (asset: SelectedAsset) => void;
}

function isImage(asset: AssetSummary) {
	return asset.mimeType.startsWith("image/");
}

function buildMarkdownSnippet(asset: AssetSummary): string {
	return isImage(asset)
		? `![${asset.alt}](${asset.url} "${asset.title}")`
		: `[${asset.title}](${asset.url})`;
}

export default function AssetLibraryModal({
	triggerLabel = "Assets",
	triggerClassName = "piko-button",
	filter,
	onSelect,
}: AssetLibraryModalProps) {
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const uploadFormRef = useRef<HTMLFormElement | null>(null);
	const [assets, setAssets] = useState<AssetSummary[]>([]);
	const [, startTransition] = useTransition();
	const [uploadState, uploadAction, uploadPending] = useActionState(
		createAssetAction,
		null,
	);
	const toast = useToast();
	const [editingId, setEditingId] = useState<string | null>(null);

	function refresh() {
		startTransition(async () => {
			setAssets(await listAssetsAction());
		});
	}

	useEffect(() => {
		if (uploadState?.success) {
			uploadFormRef.current?.reset();
			refresh();
		} else if (uploadState?.message) {
			toast.error(uploadState.message);
		} else if (uploadState?.errors) {
			for (const messages of Object.values(uploadState.errors)) {
				toast.error(messages[0]);
			}
		}
	}, [uploadState, toast]);

	function openDialog() {
		dialogRef.current?.showModal();
		refresh();
	}

	function selectAsset(asset: AssetSummary) {
		if (!onSelect) return;
		onSelect({
			id: asset.id,
			url: asset.url,
			alt: asset.alt,
			title: asset.title,
		});
		dialogRef.current?.close();
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			toast.error("Couldn't copy to the clipboard.");
			return;
		}
		toast.success("Copied");
		dialogRef.current?.close();
		// Closing returns focus to the nav trigger. When the post editor is on
		// the page, send it back to the textarea instead; the browser keeps its
		// caret, so you land at the original insert point, ready to paste.
		document.getElementById("content")?.focus();
	}

	function saveMeta(asset: AssetSummary, title: string, alt: string) {
		startTransition(async () => {
			const result = await updateAssetMetaAction(asset.id, { title, alt });
			if (result?.message) {
				toast.error(result.message);
				return;
			}
			setEditingId(null);
			refresh();
		});
	}

	const visibleAssets = filter === "image" ? assets.filter(isImage) : assets;

	return (
		<>
			<button type="button" className={triggerClassName} onClick={openDialog}>
				{triggerLabel}
			</button>

			<Modal ref={dialogRef} title="Assets" className={styles.dialog}>
				<form
					ref={uploadFormRef}
					action={uploadAction}
					className={cx("piko-vstack--small", styles.uploadForm)}
				>
					<label className={styles.field}>
						<span>File</span>
						<input type="file" name="file" required />
					</label>
					<label className={styles.field}>
						<span>Title</span>
						<input type="text" name="title" required />
					</label>
					<label className={styles.field}>
						<span>Alt text</span>
						<input type="text" name="alt" required />
					</label>
					<button
						type="submit"
						className="piko-button--primary"
						disabled={uploadPending}
					>
						{uploadPending ? "Uploading..." : "Upload"}
					</button>
				</form>

				<div className={styles.grid}>
					{visibleAssets.map((asset) => (
						<div key={asset.id} className={styles.item}>
							{isImage(asset) ? (
								<div className={styles.thumbnail}>
									<Image
										src={asset.url}
										alt={asset.alt}
										fill
										sizes="200px"
										className={styles.thumbnailImage}
									/>
								</div>
							) : (
								<div className={styles.filePlaceholder}>
									{asset.mimeType || "file"}
								</div>
							)}

							{editingId === asset.id ? (
								<EditAssetForm
									asset={asset}
									onCancel={() => setEditingId(null)}
									onSave={(title, alt) => saveMeta(asset, title, alt)}
								/>
							) : (
								<>
									<p className={styles.itemTitle}>{asset.title}</p>
									<p className={styles.itemAlt}>{asset.alt}</p>
									<div className={styles.itemActions}>
										{onSelect ? (
											<button
												type="button"
												className="piko-button--primary"
												onClick={() => selectAsset(asset)}
											>
												Select
											</button>
										) : (
											<>
												<button
													type="button"
													className="piko-button"
													onClick={() =>
														copyToClipboard(buildMarkdownSnippet(asset))
													}
												>
													Copy markdown
												</button>
												<button
													type="button"
													className="piko-button"
													onClick={() => copyToClipboard(asset.url)}
												>
													Copy URL
												</button>
											</>
										)}
										<button
											type="button"
											className="piko-button"
											onClick={() => setEditingId(asset.id)}
										>
											Edit
										</button>
										<ConfirmDelete
											deleteAction={deleteAssetAction.bind(null, asset.id)}
											buttonLabel="Delete"
											message={`Delete "${asset.title}"?`}
											onClose={refresh}
										/>
									</div>
								</>
							)}
						</div>
					))}
					{visibleAssets.length === 0 && <p>No assets yet.</p>}
				</div>
			</Modal>
		</>
	);
}

interface EditAssetFormProps {
	asset: AssetSummary;
	onSave: (title: string, alt: string) => void;
	onCancel: () => void;
}

function EditAssetForm({ asset, onSave, onCancel }: EditAssetFormProps) {
	const [title, setTitle] = useState(asset.title);
	const [alt, setAlt] = useState(asset.alt);

	return (
		<div className={cx("piko-vstack--small", styles.editForm)}>
			<label className={styles.field}>
				<span>Title</span>
				<input
					type="text"
					value={title}
					onChange={(event) => setTitle(event.currentTarget.value)}
				/>
			</label>
			<label className={styles.field}>
				<span>Alt text</span>
				<input
					type="text"
					value={alt}
					onChange={(event) => setAlt(event.currentTarget.value)}
				/>
			</label>
			<div className={styles.itemActions}>
				<button
					type="button"
					className="piko-button--primary"
					onClick={() => onSave(title, alt)}
				>
					Save
				</button>
				<button type="button" className="piko-button" onClick={onCancel}>
					Cancel
				</button>
			</div>
		</div>
	);
}
