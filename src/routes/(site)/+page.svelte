<script lang="ts">
    import {resolve} from "$app/paths";
    import type {PageData} from "./$types";
    import PostBody from "@/components/Blog/PostBody.svelte";
    import ReadingTime from "@/components/Blog/ReadingTime.svelte";
    import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate.svelte";
    import Logo from "@/components/Atoms/Logo/Logo.svelte";

    type Props = { data: PageData };
	let { data }: Props = $props();
	const posts = $derived(data.posts);

	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
	});
</script>

<svelte:head>
	<title>Hammerspace Blog</title>
</svelte:head>

<SiteTemplate>
	<header slot="header" class="hero">
		<h1 class="logo">
			<Logo />
		</h1>
		<p class="intro">
			A blog about Web Development, Software Engineering, and Technology in
			general, and maybe other topics of interest.
			<br />
			by <b>David Marland</b>
		</p>
		<nav class="actions">
			<a href={resolve("/posts")}>Browse archive</a>
			<a href={resolve("/feed.xml")}>RSS feed</a>
		</nav>
	</header>

	<main class="container">
		<section class="section">
			<div class="postList">
				{#each posts as post (post.id)}
					<article class="post">
						<header class="postHeader">
							<h2 class="postTitle piko-type-h2">
								<a href={resolve(`/posts/${post.slug}`)}>{post.title}</a>
							</h2>
							<div class="meta">
								By {post.authorName} ·
								<time dateTime={post.publishedAt.toISOString()}>
									{dateFormatter.format(post.publishedAt)}
								</time>
								· <ReadingTime wordCount={post.wordCount} />
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
						</header>
						<PostBody {post} />
					</article>
				{/each}
			</div>
		</section>
	</main>
</SiteTemplate>

<style>
	.container {
		max-width: 960px;
		margin: 0 auto;
		padding: 2rem 0 3rem;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1rem;
		margin-bottom: 2rem;
		text-align: right;
	}

	.hero h1 {
		margin: 0;
		font-size: clamp(2rem, 1.7rem + 1vw, 3rem);
	}

	.logo {
		width: min(100%, 320px);
	}

	.logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.intro {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		width: 100%;
		justify-content: flex-end;
	}

	.postList {
		display: grid;
		gap: 3rem;
	}

	.post {
		display: grid;
		gap: 1.25rem;
		padding-bottom: 2.5rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 15%, transparent);
	}

	.postHeader {
		display: grid;
		gap: 0.75rem;
	}

	.postTitle a {
		text-decoration: none;
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
	}

	.tags a {
		display: inline-flex;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 10%, transparent);
	}
</style>
