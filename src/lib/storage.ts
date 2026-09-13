import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import "dotenv/config";

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/gif": "gif",
	"image/webp": "webp",
	"image/svg+xml": "svg",
	"application/pdf": "pdf",
};

function getUploadDir(): string {
	const dir = process.env.UPLOAD_DIR;
	if (!dir) {
		throw new Error("UPLOAD_DIR environment variable is not set.");
	}
	return dir;
}

function resolveExtension(file: File): string {
	const dotIndex = file.name?.lastIndexOf(".") ?? -1;
	if (dotIndex > 0) {
		const nameExt = file.name.slice(dotIndex + 1);
		if (/^[a-zA-Z0-9]{1,10}$/.test(nameExt)) {
			return nameExt.toLowerCase();
		}
	}
	return EXTENSION_BY_MIME_TYPE[file.type] ?? "";
}

export async function writeUploadedFile(
	file: File,
): Promise<{ filename: string; size: number; mimeType: string }> {
	const uploadDir = getUploadDir();
	const id = crypto.randomUUID();
	const extension = resolveExtension(file);
	const filename = extension ? `${id}.${extension}` : id;

	await mkdir(uploadDir, { recursive: true });
	const bytes = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(uploadDir, filename), bytes);

	return {
		filename,
		size: file.size,
		mimeType: file.type || "application/octet-stream",
	};
}

export async function deleteUploadedFile(filename: string): Promise<void> {
	try {
		await unlink(path.join(getUploadDir(), filename));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			throw error;
		}
	}
}

export function buildPublicUrl(filename: string): string {
	const base = process.env.PUBLIC_ASSETS_URL;
	if (!base) {
		throw new Error("PUBLIC_ASSETS_URL environment variable is not set.");
	}
	return `${base.replace(/\/+$/, "")}/${filename}`;
}
