<script lang="ts">
	import PostCard from '@/components/Blog/PostCard.svelte';
	import PaginationNav from '@/components/PaginationNav.svelte';

	export let data;

	$: archive = data.archive;

	function buildTagHref(slug: string, page: number) {
		return page > 1 ? `/tags/${slug}?page=${page}` : `/tags/${slug}`;
	}
</script>

<svelte:head>
	<title>#{archive.tag.name} - Hammerspace Blog</title>
	<meta name="description" content={`Posts tagged ${archive.tag.name}`} />
	<link rel="canonical" href="https://davidmarland.com/tags/{archive.tag.slug}" />
</svelte:head>

<main class="container">
	<header class="header">
		<div class="tagTitle">
			<h1>#{archive.tag.name}</h1>
			<a href="/blog" class="actionLink">
				Back to archive
			</a>
		</div>
		<p class="intro">
			{archive.posts.totalCount === 0
				? 'No public posts currently use this tag.'
				: `${archive.posts.totalCount} post${archive.posts.totalCount === 1 ? '' : 's'} currently visible under this tag.`}
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
