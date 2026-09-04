<script lang="ts">
    import type {PageData} from "./$types";
    import PostCard from "@/components/Blog/PostCard.svelte";
    import PostBody from "@/components/Blog/PostBody.svelte";
    import SidePageHeader from "@/components/Blog/SidePageHeader.svelte";
    import ReadingTime from "@/components/Blog/ReadingTime.svelte";
    import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate.svelte";
    import {resolve} from "$app/paths";
    import {isPostPublic} from "$lib/blog";

    type Props = { data: PageData };
	let { data }: Props = $props();
	const post = $derived(data.post);
	const relatedPosts = $derived(data.relatedPosts);

	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
	});
</script>

<svelte:head>
	<title>{post.title} | Hammerspace</title>
	<meta name="description" content={post.excerpt || ""} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt || ""} />
	{#if post.coverImageUrl}
		<meta property="og:image" content={post.coverImageUrl} />
		<meta property="og:image:alt" content={post.coverImageAlt || post.title} />
	{/if}
	<link rel="canonical" href={`https://www.hammerspace.com/posts/${post.slug}`} />
</svelte:head>

<article>
	<SiteTemplate>
		{#snippet header()}
			<SidePageHeader title={post.title}>
				<div class="metaRow">
					<div class="meta">
						By <b>David Marland</b><br />
						{#if post.publishedAt}
							<time dateTime={post.publishedAt.toISOString()}>
								{dateFormatter.format(post.publishedAt)}
							</time>
							·
						{/if}
						<ReadingTime wordCount={post.wordCount} />
					</div>
				</div>
				{#if post.tags.length > 0}
					<ul class="tags">
						{#each post.tags as tag (tag.slug)}
							<li>
								<a href={resolve(`/tags/${tag.slug}`)}>#{tag.name}</a>
							</li>
						{/each}
					</ul>
				{/if}
			</SidePageHeader>
		{/snippet}

		{#if post.status === "DRAFT"}
			<div data-state="warning" class="piko-state__box">
				<p>This post is a DRAFT. This is not the final URL for sharing.</p>
			</div>
		{:else if post.publishedAt && !isPostPublic(post.publishedAt)}
			<div data-state="info" class="piko-state__box">
				<p>
					This post is scheduled for publication at {new Date(
						post.publishedAt,
					).toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					})}
				</p>
			</div>
		{/if}

		<PostBody {post} />

		{#if relatedPosts.length > 0}
			<aside class="piko-vstack--small">
				<h2>Related posts</h2>
				<ul class="relatedList">
					{#each relatedPosts as relatedPost (relatedPost.id)}
						<li><PostCard post={relatedPost} headingLevel="h3" /></li>
					{/each}
				</ul>
			</aside>
		{/if}
	</SiteTemplate>
</article>

<style>
	.metaRow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.meta {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		list-style: none;
		padding: 0;
		margin: 0;
		justify-content: flex-end;
	}

	.tags a {
		display: inline-flex;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 10%, transparent);
	}

	.relatedList {
		display: grid;
		gap: 1rem;
	}
</style>
