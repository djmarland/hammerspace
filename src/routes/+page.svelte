<script lang="ts">
    import PostCard from '@/components/Blog/PostCard.svelte';

    export let data;

	$: posts = data.posts;
</script>

<svelte:head>
	<title>Hammerspace Blog</title>
</svelte:head>

<main class="container">
	<header class="hero">
		<h1>Hammerspace Blog</h1>
		<p class="intro">
			Published posts and due scheduled posts appear here automatically. Drafts remain available only from their direct blog URL.
		</p>
		<form action="/search" class="searchForm">
			<input
				type="search"
				name="q"
				placeholder="Search posts"
				class="searchInput"
			/>
			<button type="submit" class="primaryLink">
				Search
			</button>
		</form>
		<nav class="actions">
			<a href="/posts" class="secondaryLink">Browse archive</a>
			<a href="/feed.xml" class="secondaryLink">RSS feed</a>
			<a href="/admin" class="secondaryLink">Admin</a>
		</nav>
	</header>

	<section class="section">
		<div class="sectionHeader">
			<h2>Latest posts</h2>
			<p>
				{posts.length === 0
					? 'No public posts yet.'
					: `Showing ${posts.length} recent posts.`}
			</p>
		</div>
		<div class="list">
			{#each posts as post (post.id)}
				<PostCard {post} />
			{/each}
		</div>
	</section>
</main>

<style>
	.container {
		max-width: 960px;
		margin: 0 auto;
		padding: 2rem 0 3rem;
	}

	.hero {
		display: grid;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.hero h1 {
		margin: 0;
		font-size: clamp(2rem, 1.7rem + 1vw, 3rem);
	}

	.intro {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.primaryLink,
	.secondaryLink {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.7rem 1rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 999px;
		text-decoration: none;
		background: transparent;
		font: inherit;
		cursor: pointer;
	}

	.searchForm {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.searchInput {
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

	.section {
		margin-top: 2rem;
	}

	.sectionHeader {
		display: grid;
		gap: 1rem;
		margin-bottom: 2rem;
	}
</style>
