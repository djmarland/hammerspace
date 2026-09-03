<script lang="ts">
    import {resolve} from "$app/paths";
    import PaginationNav from "@/components/PaginationNav.svelte";
    import type {PageData} from "./$types";
    import {isPostPublic} from "$lib/blog";

    interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let query = $state("");

	$effect(() => {
		query = data.filters?.query ?? "";
	});

	function buildHref(page: number) {
		const params = new URLSearchParams();
		if (query) params.set("query", query);
		params.set("page", String(page));
		return `/admin/posts?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>Manage Posts</title>
</svelte:head>

<div class="piko-page-container piko-vstack">
	<h1 class="piko-t-h1">Manage Posts</h1>

	<form method="get" class="filters-form">
		<label class="piko-hidden" for="query">Search</label>
		<div class="piko-hstack">
			<input
				id="query"
				type="text"
				name="query"
				placeholder="Search posts..."
				value={query}
				onchange={(e) => (query = e.currentTarget.value)}
			/>
			<button type="submit">Search</button>
		</div>
	</form>

	<hr />

	<p>
		Showing {data.posts.length} of {data.totalCount} posts
		{#if query}
			matching "{query}"
		{/if}
	</p>

	{#if data.posts.length === 0}
		<p>
			No posts found. {#if query}Try adjusting your search.{/if}
		</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Title</th>
					<th>Slug</th>
					<th>Status</th>
					<th>Publication Datetime</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each data.posts as post (post.id)}
					<tr
						class="status-row"
						data-state={post.publishedAt
							? isPostPublic(post.publishedAt)
								? "success"
								: "warning"
							: "error"}
					>
						<td>
							<a href={resolve(`/admin/posts/${post.id}/edit`)}>{post.title}</a>
						</td>
						<td class="slug-cell">{post.slug}</td>
						<td>
							{post.publishedAt
								? isPostPublic(post.publishedAt)
									? "Published"
									: "Scheduled"
								: "Draft"}
						</td>
						<td>
							{post.publishedAt
								? new Date(post.publishedAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
										hour12: false,
									})
								: "-"}
						</td>
						<td>
							<a href={resolve(`/posts/${post.slug}`)}
								>{post.publishedAt ? "View" : "Preview"}</a
							>
							{#if !post.publishedAt}
								<a href={resolve(`/admin/posts/${post.id}/publish`)}
									>Publish</a
								>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<PaginationNav
			page={data.page}
			totalPages={data.totalPages}
			buildHref={(p) => buildHref(p)}
		/>
	{/if}
</div>

<style>
	.slug-cell {
		color: var(--piko-color-text-subtle);
		font-family: monospace;
	}
	.status-row {
		background-color: var(--piko-color-state-background);
	}
</style>
