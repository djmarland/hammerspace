<script lang="ts">
    import PostCard from '@/components/Blog/PostCard.svelte';
    import MarkdownContent from '@/components/Blog/MarkdownContent.svelte';

    export let data;

	$: post = data.post;
	$: relatedPosts = data.relatedPosts;

	const dateFormatter = new Intl.DateTimeFormat('en-GB', {
		dateStyle: 'medium'
	});
</script>

<svelte:head>
	<title>{post.title} - Hammerspace Blog</title>
	<meta name="description" content={post.excerpt || ''} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt || ''} />
	{#if post.coverImageUrl}
		<meta property="og:image" content={post.coverImageUrl} />
		<meta property="og:image:alt" content={post.coverImageAlt || post.title} />
	{/if}
	<link rel="canonical" href="https://www.hammerspace.com/posts/{post.slug}" />
</svelte:head>

<main class="container">
	<p>
		<a href="/posts" class="backLink">
			← Back to archive
		</a>
	</p>

	<article class="article">
		<header class="header">
			<div class="metaRow">
				<p class="meta">
					By {post.authorName} · <time dateTime={post.publishedAt.toISOString()}>
						{dateFormatter.format(post.publishedAt)}
					</time>
					· {post.readingTimeMinutes} min read
				</p>
				{#if post.status !== 'PUBLISHED'}
					<span class="status">{post.statusLabel}</span>
				{/if}
			</div>
			<h1>{post.title}</h1>
			{#if post.tags.length > 0}
				<ul class="tags">
					{#each post.tags as tag (tag.slug)}
						<li>
							<a href={`/tags/${tag.slug}`}>#{tag.name}</a>
						</li>
					{/each}
				</ul>
			{/if}
		</header>

		{#if post.coverImageUrl}
			<img
				src={post.coverImageUrl}
				alt={post.coverImageAlt || ''}
				class="image"
			/>
		{/if}
		<div class="markdown">
			<MarkdownContent content={post.content} />
		</div>
	</article>

	{#if relatedPosts.length > 0}
		<section class="relatedSection">
			<div class="relatedHeader">
				<h2>Related posts</h2>
				<p>More posts sharing one or more tags with this article.</p>
			</div>
			<div class="relatedList">
				{#each relatedPosts as relatedPost (relatedPost.id)}
					<PostCard post={relatedPost} headingLevel="h3" />
				{/each}
			</div>
		</section>
	{/if}
</main>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 0 3rem;
	}

	.backLink {
		color: #0066cc;
		text-decoration: none;
	}

	.article,
	.relatedSection {
		display: grid;
		gap: 1.25rem;
	}

	.header {
		display: grid;
		gap: 0.85rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 18%, transparent);
	}

	.header h1,
	.relatedHeader h2 {
		margin: 0;
	}

	.metaRow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.meta,
	.relatedHeader p {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.status {
		display: inline-flex;
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 12%, transparent);
		font-size: 0.85rem;
		font-weight: 700;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tags a {
		display: inline-flex;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 10%, transparent);
	}

	.image {
		width: 100%;
		height: auto;
		border-radius: 1rem;
	}

	.markdown {
		font-size: 1.05rem;
	}

	.markdown :global(p),
	.markdown :global(ul),
	.markdown :global(ol),
	.markdown :global(blockquote),
	.markdown :global(pre) {
		margin-block: 1rem;
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
