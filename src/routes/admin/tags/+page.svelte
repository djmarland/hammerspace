<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let editingTagId = $state<string | null>(null);
	let newTagName = $state('');
	let editTagName = $state('');
	let deleteConfirm = $state<string | null>(null);
	let actionInProgress = $state(false);

	function startEdit(tagId: string, currentName: string) {
		editingTagId = tagId;
		editTagName = currentName;
	}

	function cancelEdit() {
		editingTagId = null;
		editTagName = '';
	}

	function handleDeleteClick(tagId: string) {
		deleteConfirm = tagId;
	}

	function cancelDelete() {
		deleteConfirm = null;
	}

	function handleSubmit() {
		actionInProgress = true;
	}
</script>

<svelte:head>
	<title>Manage Tags</title>
</svelte:head>

<div class="container">
	<header class="header">
		<h1>Manage Tags</h1>
	</header>

	<div class="content">
		<section class="create-section">
			<h2>Create New Tag</h2>
			<form method="post" action="?/create" class="create-form" use:enhance={() => handleSubmit()}>
				<div class="form-group">
					<label for="new-tag-name">Tag Name</label>
					<input
						id="new-tag-name"
						type="text"
						name="name"
						placeholder="Enter tag name"
						value={newTagName}
						onchange={(e) => {
							newTagName = e.currentTarget.value;
						}}
						required
					/>
				</div>
				<button type="submit" class="create-btn" disabled={actionInProgress}>
					Create Tag
				</button>
			</form>
		</section>

		<section class="tags-section">
			<h2>Existing Tags ({data.tags.length})</h2>

			{#if data.tags.length === 0}
				<div class="empty-state">
					<p>No tags exist yet. Create your first tag above.</p>
				</div>
			{:else}
				<div class="tags-list">
					{#each data.tags as tag (tag.id)}
						<div class="tag-item">
							<div class="tag-info">
								<span class="tag-name">{tag.name}</span>
								<span class="tag-count">
									{tag._count.posts}
									{tag._count.posts === 1 ? 'post' : 'posts'}
								</span>
							</div>

							{#if editingTagId === tag.id}
								<form method="post" action="?/update" class="edit-form" use:enhance={() => handleSubmit()}>
									<input type="hidden" name="tagId" value={tag.id} />
									<div class="edit-controls">
										<input
											type="text"
											name="name"
											value={editTagName}
											onchange={(e) => {
												editTagName = e.currentTarget.value;
											}}
											required
										/>
										<button type="submit" class="save-btn" disabled={actionInProgress}>
											Save
										</button>
										<button
											type="button"
											class="cancel-btn"
											onclick={cancelEdit}
											disabled={actionInProgress}
										>
											Cancel
										</button>
									</div>
								</form>
							{:else}
								<div class="tag-actions">
									<button
										type="button"
										class="edit-btn"
										onclick={() => startEdit(tag.id, tag.name)}
									>
										Edit
									</button>
									<button
										type="button"
										class="delete-btn"
										onclick={() => handleDeleteClick(tag.id)}
										disabled={tag._count.posts > 0}
										title={tag._count.posts > 0 ? 'Cannot delete tag with posts' : 'Delete tag'}
									>
										Delete
									</button>

									{#if deleteConfirm === tag.id}
										<div class="delete-confirm">
											<p>Delete "{tag.name}"?</p>
											<form method="post" action="?/delete" use:enhance={() => handleSubmit()}>
												<input type="hidden" name="tagId" value={tag.id} />
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
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	.container {
		max-width: var(--piko-page-max);
		margin: 0 auto;
		padding: var(--piko-space-5);
	}

	.header {
		margin-bottom: var(--piko-space-7);
		padding-bottom: var(--piko-space-5);
		border-bottom: 1px solid var(--piko-color-border);
	}

	.header h1 {
		font-size: 2rem;
		margin: 0;
	}

	.content {
		display: grid;
		gap: var(--piko-space-7);
	}

	.create-section {
		padding: var(--piko-space-5);
		background-color: var(--piko-color-surface);
		border: 1px solid var(--piko-color-border);
	}

	.create-section h2 {
		margin: 0 0 var(--piko-space-4) 0;
		font-size: 1.3rem;
	}

	.create-form {
		display: flex;
		gap: var(--piko-space-3);
		align-items: flex-end;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--piko-space-1);
		flex: 1;
		min-width: 250px;
	}

	.form-group label {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.form-group input {
		padding: var(--piko-space-control-padding-y) var(--piko-space-control-padding-x);
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		background-color: var(--piko-color-bg);
		color: var(--piko-color-text);
		font-size: 0.9rem;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--piko-color-primary);
	}

	.create-btn {
		padding: var(--piko-space-control-padding-y) var(--piko-space-control-padding-x);
		border: 1px solid var(--piko-color-primary-border);
		border-radius: 0;
		background-color: var(--piko-color-primary-bg);
		color: var(--piko-color-primary-text);
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.create-btn:hover:not(:disabled) {
		background-color: var(--piko-color-primary-border);
		border-color: var(--piko-color-primary-border);
	}

	.create-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.tags-section {
		padding: var(--piko-space-5);
		background-color: var(--piko-color-surface);
		border: 1px solid var(--piko-color-border);
	}

	.tags-section h2 {
		margin: 0 0 var(--piko-space-4) 0;
		font-size: 1.3rem;
	}

	.empty-state {
		padding: var(--piko-space-7);
		text-align: center;
		color: var(--piko-color-text-muted);
	}

	.tags-list {
		display: flex;
		flex-direction: column;
		gap: var(--piko-space-3);
	}

	.tag-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--piko-space-3);
		background-color: var(--piko-color-bg);
		border: 1px solid var(--piko-color-border);
		transition: background-color 0.2s ease;
	}

	.tag-item:hover {
		background-color: var(--piko-color-surface);
	}

	.tag-info {
		display: flex;
		align-items: center;
		gap: var(--piko-space-3);
		flex: 1;
	}

	.tag-name {
		font-weight: 600;
		font-size: 1rem;
	}

	.tag-count {
		display: inline-block;
		padding: 0.25rem 0.6rem;
		background-color: color-mix(in srgb, currentColor 12%, transparent);
		border-radius: 999px;
		font-size: 0.85rem;
		color: var(--piko-color-text-muted);
	}

	.tag-actions {
		display: flex;
		gap: var(--piko-space-2);
		position: relative;
	}

	.edit-btn,
	.delete-btn {
		padding: 0.35rem 0.6rem;
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		background-color: var(--piko-color-bg);
		color: var(--piko-color-text);
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s ease;
	}

	.edit-btn:hover {
		background-color: #e6f0ff;
		border-color: #99ccff;
		color: #003d82;
	}

	.delete-btn {
		background-color: #ffcccc;
		border-color: #ff9999;
		color: #cc0000;
	}

	.delete-btn:hover:not(:disabled) {
		background-color: #ff9999;
	}

	.delete-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.edit-form {
		display: contents;
	}

	.edit-controls {
		display: flex;
		gap: var(--piko-space-2);
		align-items: center;
		margin-left: auto;
	}

	.edit-controls input {
		padding: 0.35rem 0.6rem;
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		background-color: var(--piko-color-bg);
		color: var(--piko-color-text);
		font-size: 0.9rem;
		min-width: 200px;
	}

	.edit-controls input:focus {
		outline: none;
		border-color: var(--piko-color-primary);
	}

	.save-btn,
	.cancel-btn {
		padding: 0.35rem 0.6rem;
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		background-color: var(--piko-color-bg);
		color: var(--piko-color-text);
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s ease;
	}

	.save-btn {
		background-color: #e6f7ff;
		border-color: #99ccff;
		color: #003d82;
	}

	.save-btn:hover:not(:disabled) {
		background-color: #99ccff;
	}

	.cancel-btn:hover:not(:disabled) {
		background-color: #e0e0e0;
	}

	.save-btn:disabled,
	.cancel-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
		margin-top: var(--piko-space-2);
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
