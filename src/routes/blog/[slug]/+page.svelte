<script lang="ts">
	import PostCard from '@/components/Blog/PostCard.svelte';
	import MarkdownContent from '@/components/Blog/MarkdownContent.svelte';
	import styles from './page.module.css';

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
	<link rel="canonical" href="https://davidmarland.com/blog/{post.slug}" />
</svelte:head>

<main class={styles.container}>
	<p>
		<a href="/blog" class={styles.backLink}>
			← Back to archive
		</a>
	</p>

	<article class={styles.article}>
		<header class={styles.header}>
			<div class={styles.metaRow}>
				<p class={styles.meta}>
					By {post.authorName} · <time dateTime={post.publishedAt.toISOString()}>
						{dateFormatter.format(post.publishedAt)}
					</time>
					· {post.readingTimeMinutes} min read
				</p>
				{#if post.status !== 'PUBLISHED'}
					<span class={styles.status}>{post.statusLabel}</span>
				{/if}
			</div>
			<h1>{post.title}</h1>
			{#if post.tags.length > 0}
				<ul class={styles.tags}>
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
				class={styles.image}
			/>
		{/if}
		<div class={styles.markdown}>
			<MarkdownContent content={post.content} />
		</div>
	</article>

	{#if relatedPosts.length > 0}
		<section class={styles.relatedSection}>
			<div class={styles.relatedHeader}>
				<h2>Related posts</h2>
				<p>More posts sharing one or more tags with this article.</p>
			</div>
			<div class={styles.relatedList}>
				{#each relatedPosts as relatedPost (relatedPost.id)}
					<PostCard post={relatedPost} headingLevel="h3" />
				{/each}
			</div>
		</section>
	{/if}
</main>
