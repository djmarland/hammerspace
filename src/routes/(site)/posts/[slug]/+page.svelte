<script lang="ts">
    import type {PageData} from "./$types";
    import PostCard from "@/components/Blog/PostCard.svelte";
    import PostBody from "@/components/Blog/PostBody.svelte";
    import SidePageHeader from "@/components/Blog/SidePageHeader.svelte";
    import ReadingTime from "@/components/Blog/ReadingTime.svelte";
    import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate.svelte";
    import {resolve} from "$app/paths";

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
	<link rel="canonical" href="https://www.hammerspace.com/posts/{post.slug}" />
</svelte:head>

<article class="article">
	<SiteTemplate>
		<SidePageHeader slot="header" title={post.title}>
			<div class="metaRow">
				<div class="meta">
					By <b>David Marland</b><br />
					<time dateTime={post.publishedAt.toISOString()}>
						{dateFormatter.format(post.publishedAt)}
					</time>
					· <ReadingTime wordCount={post.wordCount} />
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

		<PostBody {post} />

		{#if relatedPosts.length > 0}
			<aside class="relatedSection">
				<div class="relatedHeader">
					<h2>Related posts</h2>
					<p>More posts sharing one or more tags with this article.</p>
				</div>
				<div class="relatedList">
					{#each relatedPosts as relatedPost (relatedPost.id)}
						<PostCard post={relatedPost} headingLevel="h3" />
					{/each}
				</div>
			</aside>
		{/if}
	</SiteTemplate>
</article>

<style>
	.article,
	.relatedSection {
		display: grid;
		gap: 1.25rem;
	}

	.relatedHeader h2 {
		margin: 0;
	}

	.metaRow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.meta,
	.relatedHeader p {
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

	.relatedSection {
		margin-top: 3rem;
	}

	.relatedHeader {
		display: grid;
		gap: 0.35rem;
	}

	.relatedList {
		display: grid;
		gap: 1rem;
	}
</style>
