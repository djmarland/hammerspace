<script lang="ts">
	import PaginationNav from '@/components/PaginationNav.svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let query = $state(data.filters?.query ?? '');
	let status = $state(data.filters?.status ?? 'ALL');
	let deleteConfirm = $state<string | null>(null);
	let actionInProgress = $state(false);

	function buildHref(page: number) {
		const params = new URLSearchParams();
		if (query) params.set('query', query);
		if (status !== 'ALL') params.set('status', status);
		params.set('page', String(page));
		return `?${params.toString()}`;
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

<div class="container">
	<header class="header">
		<h1>Manage Posts</h1>
		<a href="/admin/posts/new" class="new-post-btn">New Post</a>
	</header>

	<div class="filters-section">
		<form method="get" class="filters-form">
			<div class="filter-group">
				<label for="query">Search</label>
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
			</div>

			<div class="filter-group">
				<label for="status">Status</label>
				<select
					id="status"
					name="status"
					value={status}
					onchange={(e) => {
						status = e.currentTarget.value;
					}}
				>
					<option value="ALL">All</option>
					<option value="DRAFT">Draft</option>
					<option value="SCHEDULED">Scheduled</option>
					<option value="PUBLISHED">Published</option>
					<option value="ARCHIVED">Archived</option>
				</select>
			</div>

			<button type="submit" class="search-btn">Search</button>
		</form>
	</div>

	<div class="results-info">
		<p>
			Showing {data.posts.length} of {data.totalCount} posts
			{#if query}
				matching "{query}"
			{/if}
		</p>
	</div>

	{#if data.posts.length === 0}
		<div class="empty-state">
			<p>No posts found. {#if query}Try adjusting your search.{/if}</p>
		</div>
	{:else}
		<table class="posts-table">
			<thead>
				<tr>
					<th>Title</th>
					<th>Slug</th>
					<th>Status</th>
					<th>Updated</th>
					<th>Author</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.posts as post (post.id)}
					<tr>
						<td class="title-cell">
							<a href="/admin/posts/{post.id}/edit" class="post-link">{post.title}</a>
						</td>
						<td class="slug-cell">{post.slug}</td>
						<td class="status-cell">
							<span class="status-badge" data-status={post.status.toLowerCase()}>
								{post.statusLabel}
							</span>
						</td>
						<td class="updated-cell">
							{new Date(post.updatedAt).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'short',
								day: 'numeric'
							})}
						</td>
						<td class="author-cell">{post.authorName}</td>
						<td class="actions-cell">
							<div class="action-buttons">
								<a href="/admin/posts/{post.id}/edit" class="edit-btn" title="Edit post"
									>Edit</a
								>
								{#if post.status !== 'ARCHIVED'}
									<form method="post" action="?/archive" use:enhance={() => handleSubmit()}>
										<input type="hidden" name="postId" value={post.id} />
										<button
											type="submit"
											class="action-btn archive-btn"
											disabled={actionInProgress}
											title="Archive post"
										>
											Archive
										</button>
									</form>
								{/if}
								{#if post.status === 'PUBLISHED'}
									<form method="post" action="?/unpublish" use:enhance={() => handleSubmit()}>
										<input type="hidden" name="postId" value={post.id} />
										<button
											type="submit"
											class="action-btn unpublish-btn"
											disabled={actionInProgress}
											title="Unpublish post"
										>
											Unpublish
										</button>
									</form>
								{/if}
								<button
									type="button"
									class="delete-btn"
									onclick={() => handleDeleteClick(post.id)}
									title="Delete post"
								>
									Delete
								</button>
								{#if deleteConfirm === post.id}
									<div class="delete-confirm">
										<p>Delete this post permanently?</p>
										<form method="post" action="?/delete" use:enhance={() => handleSubmit()}>
											<input type="hidden" name="postId" value={post.id} />
											<button type="submit" class="confirm-delete-btn" disabled={actionInProgress}>
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
	.container {
		max-width: var(--piko-page-max);
		margin: 0 auto;
		padding: var(--piko-space-5);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--piko-space-7);
		padding-bottom: var(--piko-space-5);
		border-bottom: 1px solid var(--piko-color-border);
	}

	.header h1 {
		font-size: 2rem;
		margin: 0;
	}

	.new-post-btn {
		padding: var(--piko-space-control-padding-y) var(--piko-space-control-padding-x);
		border: 1px solid var(--piko-color-primary-border);
		border-radius: 0;
		background-color: var(--piko-color-primary-bg);
		color: var(--piko-color-primary-text);
		text-decoration: none;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.new-post-btn:hover {
		background-color: var(--piko-color-primary-border);
		border-color: var(--piko-color-primary-border);
	}

	.filters-section {
		margin-bottom: var(--piko-space-5);
		padding: var(--piko-space-4);
		background-color: var(--piko-color-surface);
		border: 1px solid var(--piko-color-border);
	}

	.filters-form {
		display: flex;
		gap: var(--piko-space-3);
		align-items: flex-end;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--piko-space-1);
		flex: 1;
		min-width: 200px;
	}

	.filter-group label {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.filter-group input,
	.filter-group select {
		padding: var(--piko-space-control-padding-y) var(--piko-space-control-padding-x);
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		background-color: var(--piko-color-bg);
		color: var(--piko-color-text);
		font-size: 0.9rem;
	}

	.filter-group input:focus,
	.filter-group select:focus {
		outline: none;
		border-color: var(--piko-color-primary);
	}

	.search-btn {
		padding: var(--piko-space-control-padding-y) var(--piko-space-control-padding-x);
		border: 1px solid var(--piko-color-primary-border);
		border-radius: 0;
		background-color: var(--piko-color-primary-bg);
		color: var(--piko-color-primary-text);
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.search-btn:hover {
		background-color: var(--piko-color-primary-border);
		border-color: var(--piko-color-primary-border);
	}

	.results-info {
		margin-bottom: var(--piko-space-4);
		padding: var(--piko-space-3);
		background-color: var(--piko-color-surface);
		font-size: 0.9rem;
		color: var(--piko-color-text-muted);
	}

	.results-info p {
		margin: 0;
	}

	.empty-state {
		padding: var(--piko-space-7);
		text-align: center;
		color: var(--piko-color-text-muted);
	}

	.posts-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: var(--piko-space-5);
		border: 1px solid var(--piko-color-border);
	}

	.posts-table thead {
		background-color: var(--piko-color-surface);
	}

	.posts-table th {
		padding: var(--piko-space-3);
		text-align: left;
		font-weight: 600;
		border-bottom: 1px solid var(--piko-color-border);
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.posts-table td {
		padding: var(--piko-space-3);
		border-bottom: 1px solid var(--piko-color-border);
		font-size: 0.9rem;
	}

	.posts-table tbody tr:hover {
		background-color: var(--piko-color-surface);
	}

	.title-cell {
		font-weight: 600;
	}

	.post-link {
		color: var(--piko-color-primary);
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.post-link:hover {
		opacity: 0.8;
		text-decoration: underline;
	}

	.slug-cell {
		color: var(--piko-color-text-muted);
		font-size: 0.85rem;
		font-family: monospace;
	}

	.status-cell {
		font-size: 0.85rem;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.6rem;
		border-radius: 0.25rem;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge[data-status='draft'] {
		background-color: #ffe6e6;
		color: #8b0000;
	}

	.status-badge[data-status='scheduled'] {
		background-color: #fff3e0;
		color: #e65100;
	}

	.status-badge[data-status='published'] {
		background-color: #e6f7ff;
		color: #003d82;
	}

	.status-badge[data-status='archived'] {
		background-color: #f0f0f0;
		color: #666666;
	}

	.updated-cell {
		font-size: 0.85rem;
		color: var(--piko-color-text-muted);
	}

	.author-cell {
		font-size: 0.85rem;
		color: var(--piko-color-text-muted);
	}

	.actions-cell {
		position: relative;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--piko-space-2);
	}

	.action-buttons form {
		display: contents;
	}

	.edit-btn,
	.action-btn,
	.delete-btn {
		padding: 0.35rem 0.6rem;
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		background-color: var(--piko-color-bg);
		color: var(--piko-color-text);
		cursor: pointer;
		font-size: 0.8rem;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		transition: all 0.2s ease;
	}

	.edit-btn {
		background-color: var(--piko-color-primary-bg);
		border-color: var(--piko-color-primary-border);
		color: var(--piko-color-primary-text);
	}

	.edit-btn:hover {
		background-color: var(--piko-color-primary-border);
	}

	.action-btn {
		background-color: #f0f0f0;
		border-color: #ccc;
		color: #333;
	}

	.action-btn:hover:not(:disabled) {
		background-color: #e0e0e0;
	}

	.action-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.archive-btn {
		background-color: #ffe6e6;
		border-color: #ffcccc;
		color: #8b0000;
	}

	.archive-btn:hover:not(:disabled) {
		background-color: #ffcccc;
	}

	.unpublish-btn {
		background-color: #fff3e0;
		border-color: #ffe0b2;
		color: #e65100;
	}

	.unpublish-btn:hover:not(:disabled) {
		background-color: #ffe0b2;
	}

	.delete-btn {
		background-color: #ffcccc;
		border-color: #ff9999;
		color: #cc0000;
	}

	.delete-btn:hover {
		background-color: #ff9999;
	}

	.delete-confirm {
		position: absolute;
		top: 100%;
		right: 0;
		z-index: 10;
		background-color: var(--piko-color-bg);
		border: 2px solid #cc0000;
		border-radius: 0;
		padding: var(--piko-space-3);
		min-width: 200px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.delete-confirm p {
		margin: 0 0 var(--piko-space-2) 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.delete-confirm form {
		display: contents;
	}

	.confirm-delete-btn,
	.cancel-delete-btn {
		padding: 0.35rem 0.6rem;
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		background-color: var(--piko-color-bg);
		color: var(--piko-color-text);
		cursor: pointer;
		font-size: 0.8rem;
		margin-right: var(--piko-space-2);
		transition: all 0.2s ease;
	}

	.confirm-delete-btn {
		background-color: #cc0000;
		border-color: #990000;
		color: white;
	}

	.confirm-delete-btn:hover:not(:disabled) {
		background-color: #990000;
	}

	.cancel-delete-btn:hover:not(:disabled) {
		background-color: #e0e0e0;
	}

	.confirm-delete-btn:disabled,
	.cancel-delete-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
