<script lang="ts">
    import {renderMarkdown} from "@/lib/markdown";
    import {onMount, tick} from "svelte";
    import {highlightAll} from "microlighter";

    interface Props {
        content: string;
    }

    const {content}: Props = $props();

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

<div class="piko-prose__block">{@html html}</div>
