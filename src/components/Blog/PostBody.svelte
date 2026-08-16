<script lang="ts">
	import type { PublicPostSummary } from "@/lib/posts";
	import MarkdownContent from "@/components/Blog/MarkdownContent.svelte";
	import ReadingTime from "@/components/Blog/ReadingTime.svelte";

	type Props = {
		post: Pick<
			PublicPostSummary,
			"content" | "coverImageUrl" | "coverImageAlt" | "wordCount"
		>;
	};

	let { post }: Props = $props();
</script>

<div class="body">
	{#if post.coverImageUrl}
		<img
			src={post.coverImageUrl}
			alt={post.coverImageAlt || ""}
			class="image"
		/>
	{/if}
	<div class="markdown piko-prose">
		<MarkdownContent content={post.content} />
	</div>
	<ReadingTime wordCount={post.wordCount} variant="footer" />
</div>

<style>
	.body {
		display: grid;
		gap: 1.25rem;
	}

	.image {
		width: 100%;
		height: auto;
		border-radius: 1rem;
	}
</style>
