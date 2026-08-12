<script lang="ts">
    import PostCard from '@/components/Blog/PostCard.svelte';
    import PaginationNav from '@/components/PaginationNav.svelte';

    export let data;

	$: query = data.query;
	$: results = data.results;

	function buildSearchHref(query: string, page: number) {
		const params = new URLSearchParams({ q: query });
		if (page > 1) {
			params.set('page', String(page));
		}
		return `/search?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>Search - Hammerspace Blog</title>
</svelte:head>

<main class="container">
	<header class="header">
		<h1>Search posts</h1>
		<p class="intro">
			Searches title, excerpt, and Markdown content across all public posts.
		</p>
		<form action="/search" class="searchForm">
			<input
				type="search"
				name="q"
				value={query}
				placeholder="Search posts"
				class="searchInput"
			/>
			<button type="submit" class="button">
				Search
			</button>
		</form>
	</header>

	{#if query}
		<p class="filterMeta">
			{results.totalCount === 0
				? `No results for "${query}".`
				: `Found ${results.totalCount} result${results.totalCount === 1 ? '' : 's'} for "${query}".`}
		</p>
		<div class="list">
			{#each results.posts as post (post.id)}
				<PostCard {post} />
			{/each}
		</div>
		<PaginationNav
			page={results.page}
			totalPages={results.totalPages}
			buildHref={(nextPage) => buildSearchHref(query, nextPage)}
		/>
	{:else}
		<p class="empty">
			Enter a search term or <a href="/posts">browse the archive</a>.
		</p>
	{/if}
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

	.intro,
	.filterMeta,
	.empty {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.button {
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

	.searchForm {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.searchInput {
		flex: 1 1 18rem;
		padding: 0.75rem 0.9rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 0.75rem;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	.list {
		display: grid;
		gap: 1rem;
	}

</style>
