<script lang="ts">
	import PostCard from '@/components/Blog/PostCard.svelte';
	import PaginationNav from '@/components/PaginationNav.svelte';
	import pageStyles from '@/components/Blog/BlogPage.module.css';

	export let data;

	$: archive = data.archive;

	function buildArchiveHref(page: number) {
		return page > 1 ? `/blog?page=${page}` : '/blog';
	}
</script>

<svelte:head>
	<title>Blog archive - Hammerspace Blog</title>
</svelte:head>

<main class={pageStyles.container}>
	<header class={pageStyles.header}>
		<h1>Blog archive</h1>
		<p class={pageStyles.intro}>
			Browse every published post and scheduled post whose time has arrived.
		</p>
		<div class={pageStyles.actions}>
			<a href="/" class={pageStyles.actionLink}>
				Home
			</a>
			<a href="/feed.xml" class={pageStyles.actionLink}>
				RSS feed
			</a>
		</div>
	</header>

	<p class={pageStyles.filterMeta}>
		Showing {archive.posts.length} of {archive.totalCount} posts.
	</p>
	<div class={pageStyles.list}>
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
