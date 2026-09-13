import { revalidatePath } from "next/cache";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { deleteUploadedFile, writeUploadedFile } from "@/lib/storage";

export type AssetFormActionState = {
	errors?: Record<string, string[]>;
	message?: string;
	success?: boolean;
} | null;

async function ensureAdminSession() {
	return getAdminSessionUser();
}

function revalidateAssetPaths() {
	revalidatePath("/admin");
}

export async function createAssetFromUpload(
	formData: FormData,
): Promise<AssetFormActionState> {
	if (!(await ensureAdminSession())) {
		return { message: "You must be logged in as an admin." };
	}

	const file = formData.get("file");
	const title = formData.get("title");
	const alt = formData.get("alt");

	const errors: Record<string, string[]> = {};
	if (!(file instanceof File) || file.size === 0) {
		errors.file = ["Choose a file to upload."];
	}
	if (typeof title !== "string" || !title.trim()) {
		errors.title = ["Title is required."];
	}
	if (typeof alt !== "string" || !alt.trim()) {
		errors.alt = ["Alt text is required."];
	}
	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	try {
		const { filename, size, mimeType } = await writeUploadedFile(file as File);
		await prisma.asset.create({
			data: {
				title: (title as string).trim(),
				alt: (alt as string).trim(),
				filename,
				mimeType,
				size,
			},
		});
	} catch (error) {
		return {
			message:
				error instanceof Error ? error.message : "Failed to upload file.",
		};
	}

	revalidateAssetPaths();
	return { success: true };
}

export async function updateAssetMeta(
	id: string,
	values: { title: string; alt: string },
): Promise<AssetFormActionState> {
	if (!(await ensureAdminSession())) {
		return { message: "You must be logged in as an admin." };
	}

	const title = values.title.trim();
	const alt = values.alt.trim();
	if (!title || !alt) {
		return { message: "Title and alt text are required." };
	}

	await prisma.asset.update({ where: { id }, data: { title, alt } });
	revalidateAssetPaths();
	return { success: true };
}

export async function deleteAssetById(id: string) {
	if (!(await ensureAdminSession())) {
		throw new Error("Unauthorized");
	}

	const asset = await prisma.asset.findUnique({ where: { id } });
	if (!asset) {
		return;
	}

	await prisma.asset.delete({ where: { id } });
	await deleteUploadedFile(asset.filename);
	revalidateAssetPaths();
}
