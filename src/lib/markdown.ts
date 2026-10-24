import { getImageProps } from "next/image";
import { Marked, type Token, type Tokens } from "marked";
import { getHeadingList, gfmHeadingId } from "marked-gfm-heading-id";

// Base URL (e.g. the canonical post page) that heading self-links and TOC
// entries are made relative to. Set per-render by renderMarkdown() so that
// the same content, when rendered somewhere that isn't the post's own page
// (e.g. a preview listed on the homepage), still links back to the post.
let headingLinkBase = "";

function headingHref(id: string) {
	return headingLinkBase ? `${headingLinkBase}#${id}` : `#${id}`;
}

function addSelfLinksToHeadings(html: string) {
	return html.replace(
		/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g,
		(fullMatch, level, attrs, content) => {
			const idMatch = attrs.match(/\s+id="([^"]+)"/);
			if (!idMatch) return fullMatch;

			const id = idMatch[1];
			const contentHasSelfLink = content.includes(`href="#${id}"`);
			if (contentHasSelfLink) return fullMatch;

			const remainingAttrs = attrs.replace(/\s+id="[^"]*"/, "").trim();
			const openingTag = remainingAttrs
				? `<h${level} ${remainingAttrs} id="${id}">`
				: `<h${level} id="${id}">`;
			const anchor = `<a href="${headingHref(id)}" class="heading-anchor">${content}</a>`;
			return `${openingTag}${anchor}</h${level}>`;
		},
	);
}

// Whether renderMarkdown() is currently rewriting images on the assets host
// to go through next/image's optimiser. Set per-render like headingLinkBase.
let optimizeImages = false;

// Only images on this host are allowed by images.remotePatterns in
// next.config.js, so only they can be optimised.
const OPTIMIZED_IMAGE_HOST = "https://assets.hammerspace.co.uk/";

// Roughly the width of the post content column.
const IMAGE_SIZES = "(max-width: 56rem) 100vw, 720px";

function escapeAttribute(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

// Create a private Marked instance so extensions/options are scoped to this module.
// This avoids mutating the global marked instance which can behave differently
// between server and client (and can be repeatedly applied during HMR/SSR).
const md = new Marked();

md.use(gfmHeadingId({ prefix: "h-" }), {
	hooks: {
		postprocess(html) {
			const headings = getHeadingList();
			if (!headings || headings.length === 0)
				return addSelfLinksToHeadings(html);

			const toc = `\n<details><summary>Table of Contents</summary><ul class="table-of-contents">\n\t${headings
				.map(
					({ id, raw, level }) =>
						`<li><a href="${headingHref(id)}" class="h${level}">${raw}</a></li>`,
				)
				.join("")}\n</ul></details>\n\n`;

			return addSelfLinksToHeadings(html.replace("<p>[TOC]</p>", toc));
		},
	},
});

// Markdown images can't use the <Image> component, so ask next/image for the
// props it would use (optimiser URL and srcset) and build the tag by hand.
// The image's real dimensions aren't known, so width/height are only there to
// satisfy the API and are not emitted.
md.use({
	renderer: {
		image({ href, title, text }) {
			if (!optimizeImages || !href.startsWith(OPTIMIZED_IMAGE_HOST)) {
				return false;
			}
			const { props } = getImageProps({
				src: href,
				alt: text,
				width: 1200,
				height: 800,
				sizes: IMAGE_SIZES,
			});
			const attributes = [
				`src="${escapeAttribute(String(props.src))}"`,
				props.srcSet && `srcset="${escapeAttribute(props.srcSet)}"`,
				props.srcSet && `sizes="${escapeAttribute(IMAGE_SIZES)}"`,
				`alt="${escapeAttribute(text)}"`,
				title && `title="${escapeAttribute(title)}"`,
				'loading="lazy"',
				'decoding="async"',
			];
			return `<img ${attributes.filter(Boolean).join(" ")}>`;
		},
	},
});

const ADMONITION_STATES: Record<string, string> = {
	info: "info",
	note: "info",
	success: "success",
	tip: "success",
	warning: "warning",
	error: "error",
	danger: "error",
	caution: "error",
};

const ADMONITION_PATTERN =
	/^:::[ \t]*(\w+)[ \t]*([^\n]*)\n([\s\S]*?)\n:::[ \t]*(?:\n+|$)/;

interface AdmonitionToken extends Tokens.Generic {
	state: string;
	title: Token[];
	tokens: Token[];
}

// Container blocks such as:
//
//   ::: warning Optional title
//   Body, as any other Markdown.
//   :::
//
// rendered as a Piko state box.
md.use({
	extensions: [
		{
			name: "admonition",
			level: "block",
			start(src) {
				return src.match(/^:::/m)?.index;
			},
			tokenizer(src) {
				const match = ADMONITION_PATTERN.exec(src);
				const state = match && ADMONITION_STATES[match[1].toLowerCase()];
				if (!match || !state) return;

				const [raw, , title, body] = match;
				return {
					type: "admonition",
					raw,
					state,
					title: this.lexer.inlineTokens(title.trim()),
					tokens: this.lexer.blockTokens(body),
				} satisfies AdmonitionToken;
			},
			renderer(token) {
				const { state, title, tokens } = token as AdmonitionToken;
				const heading = title.length
					? `<p class="admonition__title">${this.parser.parseInline(title)}</p>`
					: "";
				return `<div class="piko-prose__block piko-state__box admonition" data-state="${state}" role="note">${heading}${this.parser.parse(tokens)}</div>\n`;
			},
		},
	],
});

// Shifts every heading tag (<h1>-<h6>) and the table-of-contents "h1"-"h6"
// level classes down by `offset`, clamping to <h6> so nothing overflows.
function shiftHeadingLevels(html: string, offset: number) {
	if (!offset) return html;

	return html.replace(
		/<(\/?)h([1-6])(?=[ >])/g,
		(_match, slash: string, level: string) =>
			`<${slash}h${Math.min(6, Number(level) + offset)}`,
	);
}

interface RenderMarkdownOptions {
	// Demotes every heading by this many levels (e.g. 1 turns h2 into h3),
	// for use when the content is nested under a heading that isn't its own h1
	// (e.g. a post body listed under a page-level post title).
	headingOffset?: number;
	// Relative path to the content's canonical page (e.g. "/posts/my-post",
	// no trailing slash or hash). When set, heading self-links and TOC
	// entries point back to that page instead of a bare "#id", for use when
	// rendering the content somewhere other than its own page (e.g. a
	// preview listed on the homepage).
	headingLinkBase?: string;
	// Serve images from the assets host through next/image's optimiser
	// (resized, modern formats, cached) instead of as-is. Leave off for
	// output that leaves the site, such as the RSS feed.
	optimizeImages?: boolean;
}

export function renderMarkdown(
	content: string,
	{
		headingOffset = 0,
		headingLinkBase: linkBase = "",
		optimizeImages: optimize = false,
	}: RenderMarkdownOptions = {},
) {
	headingLinkBase = linkBase;
	optimizeImages = optimize;
	// parse is synchronous by default unless async is enabled in options/extensions
	const html = md.parse(content, { async: false }) as string;
	return shiftHeadingLevels(html, headingOffset);
}
