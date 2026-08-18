<script lang="ts">
    import {resolve} from "$app/paths";
    import type {PublicPostSummary} from "@/lib/posts";

    type Props = {
		post: PublicPostSummary;
		headingLevel?: "h2" | "h3";
	};

	let { post, headingLevel = "h2" }: Props = $props();

	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
	});
</script>

<article class="card">
	{#if post.coverImageUrl}
		<img
			src={post.coverImageUrl}
			alt={post.coverImageAlt || ""}
			class="image"
		/>
	{/if}
	<div class="content">
		<div class="metaRow">
			<p class="meta">
				By {post.authorName} ·
				<time dateTime={post.publishedAt.toISOString()}>
					{dateFormatter.format(post.publishedAt)}
				</time>
				· {post.readingTimeMinutes} min read
			</p>
		</div>
		<svelte:element this={headingLevel} class="title">
			<a href={resolve(`/posts/${post.slug}`)}>{post.title}</a>
		</svelte:element>
		<p class="excerpt">{post.excerpt || "No excerpt available."}</p>
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
	.card {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
		background: color-mix(
			in srgb,
			var(--piko-color-background) 92%,
			currentColor 8%
		);
	}

	.image {
		width: 100%;
		height: auto;
		object-fit: cover;
	}

	.content {
		display: grid;
		gap: 0.75rem;
	}

	.metaRow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.meta {
		margin: 0;
		color: color-mix(in srgb, currentColor 70%, transparent);
		font-size: 0.95rem;
	}

	.title {
		margin: 0;
		font-size: clamp(1.4rem, 1.2rem + 0.7vw, 1.9rem);
	}

	.title a {
		text-decoration: none;
	}

	.excerpt {
		margin: 0;
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
