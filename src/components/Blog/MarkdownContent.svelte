<script lang="ts">
	import { renderMarkdown } from "@/lib/markdown";

	interface Props {
		content: string;
	}

	const { content }: Props = $props();

	const html = $derived.by(() => {
		try {
			return renderMarkdown(content);
		} catch (e) {
			console.error("Markdown rendering error:", e);
			return `<p>${content}</p>`;
		}
	});
</script>

<div>{@html html}</div>
