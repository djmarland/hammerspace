"use client";

import { useEffect } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { cx } from "@/components/cx";
import styles from "./MarkdownContent.module.css";

interface MarkdownContentProps {
	content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
	let html: string;
	try {
		html = renderMarkdown(content);
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
