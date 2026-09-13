"use server";

import {
	createAssetFromUpload,
	deleteAssetById as deleteAsset,
	updateAssetMeta,
} from "@/lib/asset-form-actions";
import { listAssets } from "@/lib/assets";
import type { AssetFormActionState } from "@/lib/asset-form-actions";

/**
 * Server Actions for asset mutations, mirroring src/lib/actions/post-actions.ts.
 * `listAssetsAction` is the one deliberate exception to "Server Actions are
 * for mutations": the AssetLibraryModal is a client component opened from
 * the persistent nav on every admin page (not a server-rendered route), so
 * it has no other way to fetch its gallery data on open.
 */

export async function createAssetAction(
	_prevState: AssetFormActionState,
	formData: FormData,
): Promise<AssetFormActionState> {
	return createAssetFromUpload(formData);
}

export async function updateAssetMetaAction(
	id: string,
	values: { title: string; alt: string },
) {
	return updateAssetMeta(id, values);
}

export async function deleteAssetAction(id: string) {
	return deleteAsset(id);
}

export async function listAssetsAction() {
	return listAssets();
}
