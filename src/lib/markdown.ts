import { Marked } from "marked";
import { getHeadingList, gfmHeadingId } from "marked-gfm-heading-id";

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
			const anchor = `<a href="#${id}" class="heading-anchor">${content}</a>`;
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

			const toc = `\n<ul class="table-of-contents">\n\t${headings
				.map(
					({ id, raw, level }) =>
						`<li><a href="#${id}" class="h${level}">${raw}</a></li>`,
				)
				.join("")}\n</ul>\n\n`;

			return addSelfLinksToHeadings(html.replace("<p>[TOC]</p>", toc));
		},
	},
});

export function renderMarkdown(content: string) {
	// parse is synchronous by default unless async is enabled in options/extensions
	return md.parse(content, { async: false });
}
