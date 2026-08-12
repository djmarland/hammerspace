<script lang="ts">
	import PostCard from '@/components/Blog/PostCard.svelte';
	import PaginationNav from '@/components/PaginationNav.svelte';

	export let data;

	$: archive = data.archive;

	function buildArchiveHref(page: number) {
		return page > 1 ? `/blog?page=${page}` : '/blog';
	}
</script>

<svelte:head>
	<title>Blog archive - Hammerspace Blog</title>
</svelte:head>

<main class="container">
	<header class="header">
		<h1>Blog archive</h1>
		<p class="intro">
			Browse every published post and scheduled post whose time has arrived.
		</p>
		<div class="actions">
			<a href="/" class="actionLink">
				Home
			</a>
			<a href="/feed.xml" class="actionLink">
				RSS feed
			</a>
		</div>
	</header>

	<p class="filterMeta">
		Showing {archive.posts.length} of {archive.totalCount} posts.
	</p>
	<div class="list">
		{#each archive.posts as post (post.id)}
			<PostCard {post} />
		{/each}
	</div>
	<PaginationNav
		page={archive.page}
		totalPages={archive.totalPages}
		buildHref={buildArchiveHref}
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

	.intro,
	.filterMeta,
	.empty,
	.helper {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.actionLink,
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

	.tagTitle {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
	}
</style>
