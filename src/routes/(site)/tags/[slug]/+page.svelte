<script lang="ts">
	import { resolve } from "$app/paths";
	import type { PageData } from "./$types";
	import PostCard from "@/components/Blog/PostCard.svelte";
	import PaginationNav from "@/components/PaginationNav.svelte";

	type Props = { data: PageData };
	let { data }: Props = $props();
	const archive = $derived(data.archive);

	function buildTagHref(slug: string, page: number) {
		return page > 1 ? `/tags/${slug}?page=${page}` : `/tags/${slug}`;
	}
</script>

<svelte:head>
	<title>#{archive.tag.name} - Hammerspace Blog</title>
	<meta name="description" content={`Posts tagged ${archive.tag.name}`} />
	<link
		rel="canonical"
		href="https://www.hammerspace.co.uk/tags/{archive.tag.slug}"
	/>
</svelte:head>

<main class="container">
	<header class="header">
		<div class="tagTitle">
			<h1>#{archive.tag.name}</h1>
			<a href={resolve("/posts")} class="actionLink"> Back to archive </a>
		</div>
		<p class="intro">
			{archive.posts.totalCount === 0
				? "No public posts currently use this tag."
				: `${archive.posts.totalCount} post${archive.posts.totalCount === 1 ? "" : "s"} currently visible under this tag.`}
		</p>
	</header>
	<div class="list">
		{#each archive.posts.posts as post (post.id)}
			<PostCard {post} />
		{/each}
	</div>
	<PaginationNav
		page={archive.posts.page}
		totalPages={archive.posts.totalPages}
		buildHref={(nextPage) => buildTagHref(archive.tag.slug, nextPage)}
	/>
</main>

<style>
	.container {
		max-width: 960px;
		margin: 0 auto;
		padding: 2rem 0 3rem;
	}

	.header {
		display: grid;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.header h1 {
		margin: 0;
		font-size: clamp(2rem, 1.7rem + 1vw, 3rem);
	}

	.intro {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.actionLink {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.7rem 1rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 999px;
		text-decoration: none;
		background: transparent;
		font: inherit;
		cursor: pointer;
	}

	.tagTitle {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
	}

	.list {
		display: grid;
		gap: 1rem;
	}
</style>
