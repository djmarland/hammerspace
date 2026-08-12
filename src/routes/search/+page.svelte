<script lang="ts">
	import PostCard from '@/components/Blog/PostCard.svelte';
	import PaginationNav from '@/components/PaginationNav.svelte';
	import pageStyles from '@/components/Blog/BlogPage.module.css';

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

<main class={pageStyles.container}>
	<header class={pageStyles.header}>
		<h1>Search posts</h1>
		<p class={pageStyles.intro}>
			Searches title, excerpt, and Markdown content across all public posts.
		</p>
		<form action="/search" class={pageStyles.searchForm}>
			<input
				type="search"
				name="q"
				value={query}
				placeholder="Search posts"
				class={pageStyles.searchInput}
			/>
			<button type="submit" class={pageStyles.button}>
				Search
			</button>
		</form>
	</header>

	{#if query}
		<p class={pageStyles.filterMeta}>
			{results.totalCount === 0
				? `No results for "${query}".`
				: `Found ${results.totalCount} result${results.totalCount === 1 ? '' : 's'} for "${query}".`}
		</p>
		<div class={pageStyles.list}>
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
		<p class={pageStyles.empty}>
			Enter a search term or <a href="/blog">browse the archive</a>.
		</p>
	{/if}
</main>
