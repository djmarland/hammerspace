import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { buildPublicUrl } from "@/lib/storage";

export interface AssetSummary {
	id: string;
	title: string;
	alt: string;
	url: string;
	mimeType: string;
	size: number;
	createdAt: Date;
}

async function requireAdminSession() {
	const session = await getAdminSessionUser();
	if (!session) {
		throw new Error("Unauthorized");
	}
	return session;
}

function mapAsset(record: {
	id: string;
	title: string;
	alt: string;
	filename: string;
	mimeType: string;
	size: number;
	createdAt: Date;
}): AssetSummary {
	return {
		id: record.id,
		title: record.title,
		alt: record.alt,
		url: buildPublicUrl(record.filename),
		mimeType: record.mimeType,
		size: record.size,
		createdAt: record.createdAt,
	};
}

export async function listAssets(): Promise<AssetSummary[]> {
	await requireAdminSession();
	const assets = await prisma.asset.findMany({
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			title: true,
			alt: true,
			filename: true,
			mimeType: true,
			size: true,
			createdAt: true,
		},
	});
	return assets.map(mapAsset);
}

export async function getAssetById(id: string) {
	await requireAdminSession();
	return prisma.asset.findUnique({ where: { id } });
}
