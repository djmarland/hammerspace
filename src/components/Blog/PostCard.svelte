<script lang="ts">
	import { resolve } from "$app/paths";
	import type { PublicPostSummary } from "@/lib/posts";

	type Props = {
		post: PublicPostSummary;
		headingLevel?: "h2" | "h3";
	};

	let { post, headingLevel = "h2" }: Props = $props();

	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
	});
</script>

<article class="piko-card">
	{#if post.coverImageUrl}
		<img
			src={post.coverImageUrl}
			alt={post.coverImageAlt || ""}
			class="image"
		/>
	{/if}
	<div class="piko-vstack--small">
		<p class="piko-t-meta">
			<time dateTime={post.publishedAt.toISOString()}>
				{dateFormatter.format(post.publishedAt)}
			</time>
			· {post.readingTimeMinutes} min read
		</p>
		<svelte:element this={headingLevel}>
			<a href={resolve(`/posts/${post.slug}`)}>{post.title}</a>
		</svelte:element>
		{#if post.excerpt}
			<p class="piko-t-meta">{post.excerpt || "No excerpt available."}</p>
		{/if}
		{#if post.tags.length > 0}
			<ul class="tags">
				{#each post.tags as tag (tag.slug)}
					<li>
						<a href={resolve(`/tags/${tag.slug}`)}>#{tag.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</article>

<style>
	.image {
		width: 100%;
		height: auto;
		object-fit: cover;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tags a {
		display: inline-flex;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 10%, transparent);
		font-size: 0.95rem;
	}
</style>
