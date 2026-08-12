<script lang="ts">
	import PostCard from '@/components/Blog/PostCard.svelte';
	import PaginationNav from '@/components/PaginationNav.svelte';
	import pageStyles from '@/components/Blog/BlogPage.module.css';

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

<main class={pageStyles.container}>
	<header class={pageStyles.header}>
		<div class={pageStyles.tagTitle}>
			<h1>#{archive.tag.name}</h1>
			<a href="/blog" class={pageStyles.actionLink}>
				Back to archive
			</a>
		</div>
		<p class={pageStyles.intro}>
			{archive.posts.totalCount === 0
				? 'No public posts currently use this tag.'
				: `${archive.posts.totalCount} post${archive.posts.totalCount === 1 ? '' : 's'} currently visible under this tag.`}
		</p>
	</header>
	<div class={pageStyles.list}>
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
