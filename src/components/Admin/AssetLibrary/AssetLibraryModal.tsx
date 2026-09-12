"use client";

import {
	useActionState,
	useEffect,
	useRef,
	useState,
	useTransition,
} from "react";
import { cx } from "@/components/cx";
import ConfirmDelete from "@/components/ConfirmDelete";
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
	const [copiedId, setCopiedId] = useState<string | null>(null);
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
		}
	}, [uploadState]);

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

	async function copyMarkdown(asset: AssetSummary) {
		await navigator.clipboard.writeText(buildMarkdownSnippet(asset));
		setCopiedId(asset.id);
		setTimeout(
			() => setCopiedId((current) => (current === asset.id ? null : current)),
			1500,
		);
	}

	function saveMeta(asset: AssetSummary, title: string, alt: string) {
		startTransition(async () => {
			await updateAssetMetaAction(asset.id, { title, alt });
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

			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-label="Asset library"
			>
				<div className={styles.header}>
					<p className={styles.dialogTitle}>Assets</p>
					<button
						type="button"
						className="piko-button"
						onClick={() => dialogRef.current?.close()}
					>
						Close
					</button>
				</div>

				<form
					ref={uploadFormRef}
					action={uploadAction}
					className={cx("piko-vstack--small", styles.uploadForm)}
				>
					<label className={styles.field}>
						<span>File</span>
						<input type="file" name="file" required />
						{uploadState?.errors?.file && (
							<span className={styles.fieldError}>
								{uploadState.errors.file[0]}
							</span>
						)}
					</label>
					<label className={styles.field}>
						<span>Title</span>
						<input type="text" name="title" required />
						{uploadState?.errors?.title && (
							<span className={styles.fieldError}>
								{uploadState.errors.title[0]}
							</span>
						)}
					</label>
					<label className={styles.field}>
						<span>Alt text</span>
						<input type="text" name="alt" required />
						{uploadState?.errors?.alt && (
							<span className={styles.fieldError}>
								{uploadState.errors.alt[0]}
							</span>
						)}
					</label>
					{uploadState?.message && (
						<p className={styles.error}>{uploadState.message}</p>
					)}
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
								<img
									src={asset.url}
									alt={asset.alt}
									className={styles.thumbnail}
								/>
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
											<button
												type="button"
												className="piko-button"
												onClick={() => copyMarkdown(asset)}
											>
												{copiedId === asset.id ? "Copied!" : "Copy markdown"}
											</button>
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
			</dialog>
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
