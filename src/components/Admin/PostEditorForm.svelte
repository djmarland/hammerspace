<script lang="ts">
	import MarkdownContent from '../Blog/MarkdownContent.svelte';
	import { CMS_TIME_ZONE } from '@/lib/temporal';

	interface Props {
		submitLabel: string;
		initialValues?: {
			title?: string;
			slug?: string;
			excerpt?: string;
			content?: string;
			status?: string;
			scheduledFor?: string;
			coverImageUrl?: string;
			coverImageAlt?: string;
			tagIds?: string[];
		};
		tags: { id: string; name: string }[];
		formState?: {
			formError?: string;
			fieldErrors?: {
				title?: string;
				slug?: string;
				content?: string;
				scheduledFor?: string;
				coverImageAlt?: string;
			};
			values?: {
				title?: string;
				slug?: string;
				excerpt?: string;
				content?: string;
				status?: string;
				scheduledFor?: string;
				coverImageUrl?: string;
				coverImageAlt?: string;
				tagIds?: string[];
			};
		};
	}

	const {
		submitLabel,
		initialValues = {},
		tags,
		formState = {}
	}: Props = $props();

	let previewContent = $state(initialValues.content || '');
	let pending = $state(false);

	const fieldErrors = formState.fieldErrors || {};
	const values = formState.values || initialValues;
</script>

<form class="form" method="POST">
	{#if formState.formError}
		<p class="error">{formState.formError}</p>
	{/if}

	<label class="field">
		<span>Title</span>
		<input
			type="text"
			name="title"
			required
			value={values.title || ''}
			aria-invalid={fieldErrors.title ? 'true' : 'false'}
		/>
		{#if fieldErrors.title}
			<span class="fieldError">{fieldErrors.title}</span>
		{/if}
	</label>

	{#if tags.length > 0}
		<fieldset class="fieldset">
			<legend>Tags</legend>
			<div class={styles.tagGrid}>
				{#each tags as tag (tag.id)}
					<label class="checkboxField">
						<input
							type="checkbox"
							name="tagIds"
							value={tag.id}
							checked={(values.tagIds || []).includes(tag.id)}
						/>
						<span>{tag.name}</span>
					</label>
				{/each}
			</div>
		</fieldset>
	{/if}

	<label class="field">
		<span>Slug</span>
		<input
			type="text"
			name="slug"
			required
			value={values.slug || ''}
			aria-invalid={fieldErrors.slug ? 'true' : 'false'}
		/>
		{#if fieldErrors.slug}
			<span class="fieldError">{fieldErrors.slug}</span>
		{/if}
		<p class="helpText">
			Canonical URL is derived automatically from NEXT_PUBLIC_SITE_URL and this slug.
		</p>
	</label>

	<label class="field">
		<span>Excerpt</span>
		<textarea name="excerpt" rows={3} value={values.excerpt || ''} />
	</label>

	<label class="field">
		<span>Content (Markdown)</span>
		<textarea
			name="content"
			rows={14}
			required
			value={values.content || ''}
			onchange={(e) => (previewContent = e.currentTarget.value)}
			oninput={(e) => (previewContent = e.currentTarget.value)}
			aria-invalid={fieldErrors.content ? 'true' : 'false'}
		/>
		{#if fieldErrors.content}
			<span class="fieldError">{fieldErrors.content}</span>
		{/if}
	</label>

	<section class="preview" aria-label="Markdown preview">
		<div class="previewHeader">
			<h2>Preview</h2>
			<p>Rendered with the same MarkdownContent component used on public posts.</p>
		</div>
		<div class="previewBody">
			{#if previewContent}
				<MarkdownContent content={previewContent} />
			{:else}
				<p>Start writing to see a live preview.</p>
			{/if}
		</div>
	</section>

	<label class="field">
		<span>Status</span>
		<select name="status" value={values.status || 'DRAFT'}>
			<option value="DRAFT">Draft</option>
			<option value="SCHEDULED">Scheduled</option>
			<option value="PUBLISHED">Published</option>
			<option value="ARCHIVED">Archived</option>
		</select>
		<p class="helpText">
			Drafts remain available only on their direct blog URL. Archive a post to hide it completely.
		</p>
	</label>

	<label class="field">
		<span>Schedule for</span>
		<input
			type="datetime-local"
			name="scheduledFor"
			value={values.scheduledFor || ''}
			aria-invalid={fieldErrors.scheduledFor ? 'true' : 'false'}
		/>
		<p class="helpText">
			Stored using Temporal and interpreted as {CMS_TIME_ZONE}.
		</p>
		{#if fieldErrors.scheduledFor}
			<span class="fieldError">{fieldErrors.scheduledFor}</span>
		{/if}
	</label>

	<label class="field">
		<span>Cover image URL</span>
		<input
			type="url"
			name="coverImageUrl"
			value={values.coverImageUrl || ''}
		/>
		<p class="helpText">Only absolute external image URLs are supported.</p>
	</label>

	<label class="field">
		<span>Cover image alt text</span>
		<input
			type="text"
			name="coverImageAlt"
			value={values.coverImageAlt || ''}
		/>
		{#if fieldErrors.coverImageAlt}
			<span class="fieldError">{fieldErrors.coverImageAlt}</span>
		{/if}
	</label>

	<button type="submit" class="submitButton" disabled={pending}>
		{pending ? 'Saving...' : submitLabel}
	</button>
</form>

<style>
	.form {
		display: grid;
		gap: 1.25rem;
	}

	.field,
	.fieldset {
		display: grid;
		gap: 0.45rem;
	}

	.fieldset {
		padding: 1rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 0.75rem;
	}

	.field span,
	.fieldset legend,
	.previewHeader h2 {
		font-weight: 600;
	}

	.field input,
	.field textarea,
	.field select {
		padding: 0.75rem 0.85rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 0.75rem;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	.field textarea {
		resize: vertical;
	}

	.tagGrid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: 0.75rem;
	}

	.fieldError {
		color: #c10f0f;
		font-size: 0.9rem;
	}

	.checkboxField {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.helpText,
	.previewHeader p {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
		font-size: 0.95rem;
	}

	.preview {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 1rem;
	}

	.previewHeader {
		display: grid;
		gap: 0.35rem;
	}

	.previewHeader h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.previewBody {
		padding: 1rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--piko-color-background) 92%, currentColor 8%);
	}

	.previewBody > :first-child {
		margin-top: 0;
	}

	.previewBody > :last-child {
		margin-bottom: 0;
	}

	.submitButton {
		width: fit-content;
		padding: 0.75rem 1.2rem;
		border: 1px solid #0066cc;
		border-radius: 999px;
		background: #0066cc;
		color: #fff;
		cursor: pointer;
		font: inherit;
	}

	.submitButton:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.error {
		margin: 0;
		color: #c10f0f;
		font-weight: 600;
	}
</style>
