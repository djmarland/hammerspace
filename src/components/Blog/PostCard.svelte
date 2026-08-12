<script lang="ts">
	import type { PublicPostSummary } from '@/actions/posts';
	import styles from './PostCard.module.css';

	interface $$Props {
		post: PublicPostSummary;
		headingLevel?: 'h2' | 'h3';
	}

	export let post: PublicPostSummary;
	export let headingLevel: 'h2' | 'h3' = 'h2';

	const dateFormatter = new Intl.DateTimeFormat('en-GB', {
		dateStyle: 'medium'
	});

	$: shouldShowStatus = post.status !== 'PUBLISHED';
</script>

<article class={styles.card}>
	{#if post.coverImageUrl}
		<img
			src={post.coverImageUrl}
			alt={post.coverImageAlt || ''}
			class={styles.image}
		/>
	{/if}
	<div class={styles.content}>
		<div class={styles.metaRow}>
			<p class={styles.meta}>
				By {post.authorName} ·
				<time dateTime={post.publishedAt.toISOString()}>
					{dateFormatter.format(post.publishedAt)}
				</time>
				· {post.readingTimeMinutes} min read
			</p>
			{#if shouldShowStatus}
				<span class={styles.status}>{post.statusLabel}</span>
			{/if}
		</div>
		<svelte:element this={headingLevel} class={styles.title}>
			<a href={`/blog/${post.slug}`}>{post.title}</a>
		</svelte:element>
		<p class={styles.excerpt}>{post.excerpt || 'No excerpt available.'}</p>
		{#if post.tags.length > 0}
			<ul class={styles.tags}>
				{#each post.tags as tag (tag.slug)}
					<li>
						<a href={`/tags/${tag.slug}`}>#{tag.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</article>
