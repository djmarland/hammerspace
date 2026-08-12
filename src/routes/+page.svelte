<script lang="ts">
	import PostCard from '@/components/Blog/PostCard.svelte';
	import styles from './page.module.css';

	export let data;

	$: posts = data.posts;
</script>

<svelte:head>
	<title>Hammerspace Blog</title>
</svelte:head>

<main class={styles.container}>
	<header class={styles.hero}>
		<p class={styles.eyebrow}>Public-first publishing</p>
		<h1>Hammerspace Blog</h1>
		<p class={styles.intro}>
			Published posts and due scheduled posts appear here automatically. Drafts remain available only from their direct blog URL.
		</p>
		<form action="/search" class={styles.searchForm}>
			<input
				type="search"
				name="q"
				placeholder="Search posts"
				class={styles.searchInput}
			/>
			<button type="submit" class={styles.primaryLink}>
				Search
			</button>
		</form>
		<nav class={styles.actions}>
			<a href="/blog" class={styles.secondaryLink}>Browse archive</a>
			<a href="/feed.xml" class={styles.secondaryLink}>RSS feed</a>
			<a href="/admin" class={styles.secondaryLink}>Admin</a>
		</nav>
	</header>

	<section class={styles.section}>
		<div class={styles.sectionHeader}>
			<h2>Latest posts</h2>
			<p>
				{posts.length === 0
					? 'No public posts yet.'
					: `Showing ${posts.length} recent posts.`}
			</p>
		</div>
		<div class={styles.list}>
			{#each posts as post (post.id)}
				<PostCard {post} />
			{/each}
		</div>
	</section>
</main>

