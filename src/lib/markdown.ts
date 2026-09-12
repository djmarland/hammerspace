import { Marked } from "marked";
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
}

export function renderMarkdown(
	content: string,
	{
		headingOffset = 0,
		headingLinkBase: linkBase = "",
	}: RenderMarkdownOptions = {},
) {
	headingLinkBase = linkBase;
	// parse is synchronous by default unless async is enabled in options/extensions
	const html = md.parse(content, { async: false }) as string;
	return shiftHeadingLevels(html, headingOffset);
}
