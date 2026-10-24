import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface LinkedMedia {
	file: string;
	type: "photo" | "video";
	width: number;
	height: number;
}

interface Source {
	url: string;
	type: "photo" | "video";
	width?: number;
	height?: number;
}

const userAgent = "Mozilla/5.0";

function sniffExtension(data: Buffer) {
	if (data[0] === 0xff && data[1] === 0xd8) {
		return "jpg";
	}
	if (data.length > 8 && data.readUInt32BE(0) === 0x89504e47) {
		return "png";
	}
	if (data.toString("ascii", 0, 4) === "GIF8") {
		return "gif";
	}
	if (
		data.toString("ascii", 0, 4) === "RIFF" &&
		data.toString("ascii", 8, 12) === "WEBP"
	) {
		return "webp";
	}
	if (data.toString("ascii", 4, 8) === "ftyp") {
		return "mp4";
	}
	return null;
}

function get(url: string) {
	return fetch(url, {
		headers: { "user-agent": userAgent },
		redirect: "follow",
		signal: AbortSignal.timeout(30_000),
	});
}

async function getPage(url: string) {
	const response = await get(url);
	return response.ok
		? { url: response.url, html: await response.text() }
		: null;
}

function decodeAttribute(value: string) {
	return value.replaceAll("&amp;", "&");
}

function unescapeJsonString(value: string) {
	return value.replace(/\\+\//g, "/").replace(/\\+u0026/g, "&");
}

async function twitpic(href: string): Promise<Source | null> {
	const page = await getPage(href);
	const match =
		page &&
		/https:\/\/[\w.]+cloudfront\.net\/photos\/large\/[^"']+/.exec(page.html);
	return match ? { url: decodeAttribute(match[0]), type: "photo" } : null;
}

async function flickr(href: string): Promise<Source | null> {
	const page = await getPage(href);
	if (!page || !/^\/photos\/[^/]+\/\d+/.test(new URL(page.url).pathname)) {
		return null;
	}
	const match = /og:image"\s+content="([^"]+)"/.exec(page.html);
	return match ? { url: decodeAttribute(match[1]), type: "photo" } : null;
}

async function instagram(href: string): Promise<Source | null> {
	const code = /\/p\/([\w-]+)/.exec(new URL(href).pathname)?.[1];
	const page = code
		? await getPage(`https://www.instagram.com/p/${code}/embed/`)
		: null;
	if (!page) {
		return null;
	}
	const video = /video_url\\":\\"(.*?)\\"/.exec(page.html);
	const dimensions =
		/dimensions\\":\{\\"height\\":(\d+),\\"width\\":(\d+)/.exec(page.html);
	if (video && dimensions) {
		return {
			url: unescapeJsonString(video[1]),
			type: "video",
			width: Number(dimensions[2]),
			height: Number(dimensions[1]),
		};
	}
	const image = /class="EmbeddedMediaImage"[^>]*src="([^"]+)"/.exec(page.html);
	return image ? { url: decodeAttribute(image[1]), type: "photo" } : null;
}

function handlerFor(href: string) {
	const { hostname, pathname } = new URL(href);
	const host = hostname.replace(/^www\./, "");
	if (host === "twitpic.com") {
		return twitpic;
	}
	if (host === "flic.kr" || host === "flickr.com") {
		return flickr;
	}
	if (host === "instagram.com" || host === "instagr.am") {
		return instagram;
	}
	if (/\.(jpe?g|png|gif|webp)$/i.test(pathname)) {
		return async (url: string): Promise<Source> => ({ url, type: "photo" });
	}
	return null;
}

export function isLinkedMediaCandidate(href: string) {
	try {
		return handlerFor(href) !== null;
	} catch {
		return false;
	}
}

function imageSize(data: Buffer) {
	if (data.length > 24 && data.readUInt32BE(0) === 0x89504e47) {
		return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
	}
	if (data.toString("ascii", 0, 3) === "GIF") {
		return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
	}
	if (
		data.toString("ascii", 0, 4) === "RIFF" &&
		data.toString("ascii", 8, 12) === "WEBP"
	) {
		const chunk = data.toString("ascii", 12, 16);
		if (chunk === "VP8X") {
			return {
				width: 1 + data.readUIntLE(24, 3),
				height: 1 + data.readUIntLE(27, 3),
			};
		}
		if (chunk === "VP8 ") {
			return {
				width: data.readUInt16LE(26) & 0x3fff,
				height: data.readUInt16LE(28) & 0x3fff,
			};
		}
		if (chunk === "VP8L") {
			const bits = data.readUInt32LE(21);
			return {
				width: 1 + (bits & 0x3fff),
				height: 1 + ((bits >> 14) & 0x3fff),
			};
		}
	}
	if (data[0] === 0xff && data[1] === 0xd8) {
		let offset = 2;
		while (offset + 9 < data.length) {
			if (data[offset] !== 0xff) {
				offset++;
				continue;
			}
			const marker = data[offset + 1];
			if (
				marker === 0xff ||
				marker === 0xd8 ||
				marker === 0x01 ||
				(marker >= 0xd0 && marker <= 0xd7)
			) {
				offset += marker === 0xff ? 1 : 2;
				continue;
			}
			if (
				marker >= 0xc0 &&
				marker <= 0xcf &&
				marker !== 0xc4 &&
				marker !== 0xc8 &&
				marker !== 0xcc
			) {
				return {
					height: data.readUInt16BE(offset + 5),
					width: data.readUInt16BE(offset + 7),
				};
			}
			offset += 2 + data.readUInt16BE(offset + 2);
		}
	}
	return null;
}

async function download(
	href: string,
	cacheDir: string,
): Promise<LinkedMedia | null> {
	const source = await handlerFor(href)?.(href);
	if (!source) {
		return null;
	}
	const response = await get(source.url);
	if (!response.ok) {
		return null;
	}
	const data = Buffer.from(await response.arrayBuffer());
	const extension = sniffExtension(data);
	if (!extension || (extension === "mp4") !== (source.type === "video")) {
		return null;
	}
	const size =
		source.type === "video" && source.width && source.height
			? { width: source.width, height: source.height }
			: imageSize(data);
	if (!size) {
		return null;
	}
	const file = `${createHash("sha1").update(href).digest("hex").slice(0, 16)}.${extension}`;
	writeFileSync(path.join(cacheDir, file), data);
	return { file, type: source.type, ...size };
}

export async function resolveLinkedMedia(hrefs: string[], cacheDir: string) {
	mkdirSync(cacheDir, { recursive: true });
	const indexPath = path.join(cacheDir, "index.json");
	const index: Record<string, LinkedMedia | null> = existsSync(indexPath)
		? JSON.parse(readFileSync(indexPath, "utf8"))
		: {};

	const pending = hrefs.filter((href) => !(href in index));
	if (pending.length) {
		console.log(`Fetching ${pending.length} linked images and videos…`);
	}
	for (let i = 0; i < pending.length; i += 4) {
		await Promise.all(
			pending.slice(i, i + 4).map(async (href) => {
				try {
					index[href] = await download(href, cacheDir);
				} catch (error) {
					console.warn(`Couldn't fetch ${href}: ${(error as Error).message}`);
				}
			}),
		);
		writeFileSync(indexPath, JSON.stringify(index, null, "\t"));
	}

	return new Map(
		hrefs.flatMap((href) => {
			const media = index[href];
			return media && existsSync(path.join(cacheDir, media.file))
				? [[href, media] as const]
				: [];
		}),
	);
}
