import { marked } from "marked";

export function renderMarkdown(content: string) {
	return marked.parse(content, { async: false });
}
