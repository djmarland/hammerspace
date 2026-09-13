"use client";

import AssetLibraryModal from "@/components/Admin/AssetLibrary/AssetLibraryModal";

export default function AssetLibraryNavItem() {
	return (
		<li>
			<AssetLibraryModal triggerLabel="Assets" triggerClassName="piko-link" />
		</li>
	);
}
