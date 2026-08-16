<script lang="ts">
	import { resolve } from "$app/paths";
	import PostEditorForm from "@/components/Admin/PostEditorForm.svelte";
	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Create New Post</title>
</svelte:head>

<div class="container">
	<header class="header">
		<h1>Create New Post</h1>
		<a href={resolve("/admin/posts")} class="back-link">← Back to posts</a>
	</header>

	<PostEditorForm
		action="?/create"
		submitLabel="Create Post"
		tags={data.tags}
	/>
</div>

<style>
	.container {
		max-width: var(--piko-page-max);
		margin: 0 auto;
		padding: var(--piko-space-5);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--piko-space-7);
		padding-bottom: var(--piko-space-5);
		border-bottom: 1px solid var(--piko-color-border);
	}

	.header h1 {
		font-size: 2rem;
		margin: 0;
	}

	.back-link {
		color: var(--piko-color-primary);
		text-decoration: none;
		font-size: 0.9rem;
		transition: opacity 0.2s ease;
	}

	.back-link:hover {
		opacity: 0.8;
		text-decoration: underline;
	}
</style>
