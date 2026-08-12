<script lang="ts">
	import { marked } from 'marked';

	interface Props {
		content: string;
	}

	const { content }: Props = $props();

	const html = $derived.by(() => {
		try {
			return marked(content);
		} catch (e) {
			console.error('Markdown rendering error:', e);
			return `<p>${content}</p>`;
		}
	});
</script>

<div>{@html html}</div>

