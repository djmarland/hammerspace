<script lang="ts">
	import { renderMarkdown } from "@/lib/markdown";
	import { onMount, tick } from "svelte";
	import { highlightAll } from "microlighter";

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

	onMount(async () => {
		await tick();
		await highlightAll();
	});
</script>

<div class="piko-prose__block markdown-content">{@html html}</div>

<style>
	.markdown-content {
		:global(.table-of-contents) {
			& li:has(:global(.h3)) {
				margin-inline-start: 1em;
			}
			& li:has(:global(.h4)) {
				margin-inline-start: 2em;
			}
			& li:has(:global(.h5)) {
				margin-inline-start: 3em;
			}
			& li:has(:global(.h6)) {
				margin-inline-start: 4em;
			}
		}

		:global(.heading-anchor) {
			color: inherit;
			text-decoration: inherit;
			&:hover {
				text-decoration: underline;
			}
		}
	}
</style>
