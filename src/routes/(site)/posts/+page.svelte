<script lang="ts">
    import {resolve} from "$app/paths";
    import type {PageData} from "./$types";
    import PostCard from "@/components/Blog/PostCard.svelte";
    import SidePageHeader from "@/components/Blog/SidePageHeader.svelte";
    import PaginationNav from "@/components/PaginationNav.svelte";
    import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate.svelte";

    type Props = { data: PageData };
	let { data }: Props = $props();
	const archive = $derived(data.archive);

	function buildArchiveHref(page: number) {
		return page > 1 ? `/posts?page=${page}` : "/posts";
	}
</script>

<svelte:head>
	<title>Archive | Hammerspace</title>
</svelte:head>

<SiteTemplate>
	{#snippet header()}
		<SidePageHeader title="Archive">
			<a href={resolve("/feed.xml")} class="actionLink">RSS feed</a>
		</SidePageHeader>
	{/snippet}

	<div class="content">
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
	</div>
</SiteTemplate>

<style>
	.content {
		display: grid;
		gap: 1.5rem;
		max-width: 75ch;
		padding: var(--piko-unit-double);
	}

	.filterMeta {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	:global(.searchForm) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	:global(.searchInput) {
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
