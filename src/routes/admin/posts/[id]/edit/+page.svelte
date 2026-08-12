<script lang="ts">
	import PostEditorForm from '@/components/Admin/PostEditorForm.svelte';
	import ConfirmSubmitButton from '@/components/Admin/ConfirmSubmitButton.svelte';
	import { formatDateTimeLocalValue } from '@/lib/temporal';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let actionInProgress = $state(false);
	let deleteConfirm = $state(false);

	function handleSubmit() {
		actionInProgress = true;
	}

	function cancelDelete() {
		deleteConfirm = false;
		actionInProgress = false;
	}
</script>

<svelte:head>
	<title>Edit Post: {data.post.title}</title>
</svelte:head>

<div class="container">
	<header class="header">
		<div class="header-content">
			<h1>{data.post.title}</h1>
			<div class="dates">
				<p class="date-info">
					<span class="label">Created:</span>
					<time>{new Date(data.post.createdAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					})}</time>
				</p>
				<p class="date-info">
					<span class="label">Updated:</span>
					<time>{new Date(data.post.updatedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					})}</time>
				</p>
				{#if data.post.publishedAt}
					<p class="date-info">
						<span class="label">Published:</span>
						<time>{new Date(data.post.publishedAt).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})}</time>
					</p>
				{/if}
			</div>
		</div>
		<a href="/admin/posts" class="back-link">← Back to posts</a>
	</header>

	<PostEditorForm
		submitLabel="Update Post"
		tags={data.tags}
		initialValues={{
			title: data.post.title,
			slug: data.post.slug,
			excerpt: data.post.excerpt || '',
			content: data.post.content,
			status: data.post.status,
			scheduledFor: data.post.scheduledFor ? formatDateTimeLocalValue(data.post.scheduledFor) : '',
			coverImageUrl: data.post.coverImageUrl || '',
			coverImageAlt: data.post.coverImageAlt || '',
			tagIds: data.post.tags.map((tag) => tag.tagId),
		}}
	/>

	<section class="danger-zone">
		<h2>Danger Zone</h2>
		<p class="danger-zone-intro">These actions are permanent and cannot be undone.</p>

		<div class="danger-actions">
			{#if data.post.status === 'PUBLISHED'}
				<div class="action-group">
					<div class="action-info">
						<h3>Unpublish Post</h3>
						<p>Move this post back to draft status. It will no longer be publicly visible.</p>
					</div>
					<form method="post" action="?/unpublish" use:enhance={() => handleSubmit()}>
						<input type="hidden" name="postId" value={data.post.id} />
						<ConfirmSubmitButton
							label="Unpublish"
							confirmMessage="Unpublish this post? It will no longer be publicly visible."
							className="btn-warning"
						/>
					</form>
				</div>
			{/if}

			{#if data.post.status !== 'ARCHIVED'}
				<div class="action-group">
					<div class="action-info">
						<h3>Archive Post</h3>
						<p>Archived posts are hidden from the public and search. They can be restored later.</p>
					</div>
					<form method="post" action="?/archive" use:enhance={() => handleSubmit()}>
						<input type="hidden" name="postId" value={data.post.id} />
						<ConfirmSubmitButton
							label="Archive"
							confirmMessage="Archive this post? It will be hidden from the public."
							className="btn-warning"
						/>
					</form>
				</div>
			{/if}

			<div class="action-group danger-delete">
				<div class="action-info">
					<h3>Delete Post</h3>
					<p>Permanently delete this post. This action cannot be undone.</p>
				</div>
				{#if !deleteConfirm}
					<button
						type="button"
						class="btn-danger"
						onclick={() => {
							deleteConfirm = true;
						}}
					>
						Delete
					</button>
				{:else}
					<div class="delete-confirm-panel">
						<p class="confirm-message">Are you absolutely sure you want to delete this post permanently?</p>
						<div class="confirm-buttons">
							<form method="post" action="?/delete" use:enhance={() => handleSubmit()}>
								<input type="hidden" name="postId" value={data.post.id} />
								<button
									type="submit"
									class="btn-delete-confirm"
									disabled={actionInProgress}
								>
									{actionInProgress ? 'Deleting...' : 'Yes, Delete Permanently'}
								</button>
							</form>
							<button
								type="button"
								class="btn-cancel"
								onclick={cancelDelete}
								disabled={actionInProgress}
							>
								Cancel
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</section>
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
		align-items: flex-start;
		margin-bottom: var(--piko-space-7);
		padding-bottom: var(--piko-space-5);
		border-bottom: 1px solid var(--piko-color-border);
		gap: var(--piko-space-4);
	}

	.header-content {
		flex: 1;
	}

	.header h1 {
		font-size: 2rem;
		margin: 0 0 var(--piko-space-3) 0;
	}

	.dates {
		display: flex;
		gap: var(--piko-space-4);
		flex-wrap: wrap;
	}

	.date-info {
		margin: 0;
		font-size: 0.9rem;
		color: var(--piko-color-text-muted);
	}

	.date-info .label {
		font-weight: 600;
		color: var(--piko-color-text);
	}

	.date-info time {
		margin-left: 0.5rem;
	}

	.back-link {
		color: var(--piko-color-primary);
		text-decoration: none;
		font-size: 0.9rem;
		white-space: nowrap;
		transition: opacity 0.2s ease;
	}

	.back-link:hover {
		opacity: 0.8;
		text-decoration: underline;
	}

	.danger-zone {
		margin-top: var(--piko-space-7);
		padding: var(--piko-space-5);
		border: 2px solid #cc0000;
		border-radius: 0.5rem;
		background: color-mix(in srgb, #cc0000 2%, transparent);
	}

	.danger-zone h2 {
		margin: 0 0 var(--piko-space-2) 0;
		color: #cc0000;
		font-size: 1.3rem;
	}

	.danger-zone-intro {
		margin: 0 0 var(--piko-space-5) 0;
		color: var(--piko-color-text-muted);
		font-size: 0.95rem;
	}

	.danger-actions {
		display: grid;
		gap: var(--piko-space-5);
	}

	.action-group {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--piko-space-4);
		padding: var(--piko-space-4);
		border: 1px solid color-mix(in srgb, #cc0000 25%, transparent);
		border-radius: 0.375rem;
		background: var(--piko-color-bg);
	}

	.action-group.danger-delete {
		flex-direction: column;
		align-items: flex-start;
	}

	.action-info {
		flex: 1;
	}

	.action-info h3 {
		margin: 0 0 var(--piko-space-1) 0;
		font-size: 1rem;
	}

	.action-info p {
		margin: 0;
		color: var(--piko-color-text-muted);
		font-size: 0.9rem;
	}

	.btn-danger,
	.btn-delete-confirm,
	.btn-cancel {
		padding: 0.5rem 1rem;
		border: 1px solid var(--piko-color-border);
		border-radius: 0.375rem;
		background: var(--piko-color-bg);
		color: var(--piko-color-text);
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	:global(.btn-warning) {
		background-color: #fff3e0;
		border-color: #ffe0b2;
		color: #e65100;
	}

	:global(.btn-warning:hover:not(:disabled)) {
		background-color: #ffe0b2;
	}

	.btn-danger {
		background-color: #ffcccc;
		border-color: #ff9999;
		color: #cc0000;
	}

	.btn-danger:hover {
		background-color: #ff9999;
	}

	.delete-confirm-panel {
		width: 100%;
		padding: var(--piko-space-4);
		border: 2px solid #cc0000;
		border-radius: 0.375rem;
		background: color-mix(in srgb, #cc0000 5%, transparent);
	}

	.confirm-message {
		margin: 0 0 var(--piko-space-3) 0;
		color: #cc0000;
		font-weight: 600;
	}

	.confirm-buttons {
		display: flex;
		gap: var(--piko-space-3);
		flex-wrap: wrap;
	}

	.confirm-buttons form {
		display: contents;
	}

	.btn-delete-confirm {
		background-color: #cc0000;
		border-color: #990000;
		color: white;
	}

	.btn-delete-confirm:hover:not(:disabled) {
		background-color: #990000;
	}

	.btn-delete-confirm:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-cancel:hover:not(:disabled) {
		background-color: #e0e0e0;
	}

	.btn-cancel:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-group form {
		display: contents;
	}
</style>
