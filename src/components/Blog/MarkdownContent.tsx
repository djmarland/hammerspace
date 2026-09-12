"use client";

import { useEffect } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { cx } from "@/components/cx";
import styles from "./MarkdownContent.module.css";

interface MarkdownContentProps {
	content: string;
	// Set when this content is rendered under a heading that isn't its own
	// h1 (e.g. a post body listed among others on the homepage, under an h2
	// post title) so the content's own headings don't skip a level.
	demoteHeadings?: boolean;
	// Relative path to the content's own page. When set, heading self-links
	// and TOC entries point back to that page instead of a bare "#id" (e.g.
	// a post preview listed on the homepage links to the anchor on the post
	// page itself).
	headingLinkBase?: string;
}

export default function MarkdownContent({
	content,
	demoteHeadings,
	headingLinkBase,
}: MarkdownContentProps) {
	let html: string;
	try {
		html = renderMarkdown(content, {
			headingOffset: demoteHeadings ? 1 : 0,
			headingLinkBase,
		});
	} catch (error) {
		console.error("Markdown rendering error:", error);
		html = `<p>${content}</p>`;
	}

	useEffect(() => {
		// microlighter only highlights on load, so re-trigger it whenever this
		// content mounts/changes (e.g. client-side navigation between posts).
		document.dispatchEvent(new Event("syntax-highlight"));
	}, [html]);

	return (
		<div
			className={cx("piko-prose__block", styles.markdownContent)}
			// Content is admin-authored and trusted directly.
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
