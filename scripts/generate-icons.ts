import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
	H_PATH,
	STATIC_ICON_HUE,
	hViewBox,
	paletteHex,
} from "../src/lib/favicon";

const publicDir = path.join(__dirname, "..", "public");
const foreground = paletteHex(7, STATIC_ICON_HUE);
const background = paletteHex(1, STATIC_ICON_HUE);

function iconSvg(size: number, padding: number, withBackground: boolean) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${hViewBox(padding)}">
	${withBackground ? `<rect x="-1000" y="-1000" width="3000" height="3000" fill="${background}" />` : ""}
	<path fill="${foreground}" d="${H_PATH}" />
</svg>`;
}

function renderPng(size: number, padding: number, withBackground = false) {
	return sharp(Buffer.from(iconSvg(size, padding, withBackground)))
		.png()
		.toBuffer();
}

// Packs PNG images into an .ico container (PNG-compressed entries).
function packIco(images: { size: number; png: Buffer }[]) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(images.length, 4);

	let offset = header.length + images.length * 16;
	const entries = images.map(({ size, png }) => {
		const entry = Buffer.alloc(16);
		entry.writeUInt8(size >= 256 ? 0 : size, 0);
		entry.writeUInt8(size >= 256 ? 0 : size, 1);
		entry.writeUInt16LE(1, 4);
		entry.writeUInt16LE(32, 6);
		entry.writeUInt32LE(png.length, 8);
		entry.writeUInt32LE(offset, 12);
		offset += png.length;
		return entry;
	});

	return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

async function main() {
	const icoImages = await Promise.all(
		[16, 32, 48].map(async (size) => ({ size, png: await renderPng(size, 0) })),
	);

	const outputs: [string, Buffer][] = [
		["favicon.ico", packIco(icoImages)],
		["apple-touch-icon.png", await renderPng(180, 0.16, true)],
		["icon-192.png", await renderPng(192, 0.04)],
		["icon-512.png", await renderPng(512, 0.04)],
		["icon-maskable-512.png", await renderPng(512, 0.22, true)],
	];

	for (const [name, data] of outputs) {
		await writeFile(path.join(publicDir, name), data);
		console.log(`Wrote public/${name}`);
	}
}

main();
