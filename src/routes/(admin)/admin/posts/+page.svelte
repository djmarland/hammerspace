<script lang="ts">
    import {resolve} from "$app/paths";
    import PaginationNav from "@/components/PaginationNav.svelte";
    import type {PageData} from "./$types";
    import {enhance} from "$app/forms";

    interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let query = $state("");
	let deleteConfirm = $state<string | null>(null);
	let actionInProgress = $state(false);

	$effect(() => {
		query = data.filters?.query ?? "";
	});

	function buildHref(page: number) {
		const params = new URLSearchParams();
		if (query) params.set("query", query);
		params.set("page", String(page));
		return `/admin/posts?${params.toString()}`;
	}

	function handleDeleteClick(postId: string) {
		deleteConfirm = postId;
	}

	function cancelDelete() {
		deleteConfirm = null;
	}

	function handleSubmit() {
		actionInProgress = true;
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
                onchange={(e) => {
                    query = e.currentTarget.value;
                }}
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
					<th>Updated</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.posts as post (post.id)}
					<tr>
						<td>
							<a
								href={resolve(`/admin/posts/${post.id}/edit`)}
								>{post.title}</a
							>
						</td>
						<td class="slug-cell">{post.slug}</td>
						<td class="status-cell" data-state={post.publishedAt ? "success" : "warning"}>
								{post.publishedAt ? "Published" : "Draft"}
						</td>
						<td>
							{new Date(post.updatedAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</td>
						<td class="actions-cell">
							<div class="piko-hstack">
								<a
									href={resolve(`/admin/posts/${post.id}/edit`)}
									class="piko-button--primary"
									title="Edit post">Edit</a
								>
								<button
									type="button"
									class="piko-button--danger"
									onclick={() => handleDeleteClick(post.id)}
									title="Delete post"
								>
									Delete
								</button>
								{#if deleteConfirm === post.id}
									<div class="delete-confirm">
										<p>Delete this post permanently?</p>
										<form
											method="post"
											action="?/delete"
											use:enhance={() => handleSubmit()}
										>
											<input type="hidden" name="postId" value={post.id} />
											<button
												type="submit"
												class="confirm-delete-btn"
												disabled={actionInProgress}
											>
												Yes, Delete
											</button>
										</form>
										<button
											type="button"
											class="cancel-delete-btn"
											onclick={cancelDelete}
											disabled={actionInProgress}
										>
											Cancel
										</button>
									</div>
								{/if}
							</div>
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
    .status-cell {
      background-color: var(--piko-color-state-background);
    }

	.actions-cell {
		position: relative;
	}
</style>
