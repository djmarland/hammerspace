<script lang="ts">
	import MarkdownContent from '../Blog/MarkdownContent.svelte';
	import { CMS_TIME_ZONE } from '@/lib/temporal';
	import styles from './PostEditorForm.module.css';

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

<form class={styles.form} method="POST">
	{#if formState.formError}
		<p class={styles.error}>{formState.formError}</p>
	{/if}

	<label class={styles.field}>
		<span>Title</span>
		<input
			type="text"
			name="title"
			required
			value={values.title || ''}
			aria-invalid={fieldErrors.title ? 'true' : 'false'}
		/>
		{#if fieldErrors.title}
			<span class={styles.fieldError}>{fieldErrors.title}</span>
		{/if}
	</label>

	{#if tags.length > 0}
		<fieldset class={styles.fieldset}>
			<legend>Tags</legend>
			<div class={styles.tagGrid}>
				{#each tags as tag (tag.id)}
					<label class={styles.checkboxField}>
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

	<label class={styles.field}>
		<span>Slug</span>
		<input
			type="text"
			name="slug"
			required
			value={values.slug || ''}
			aria-invalid={fieldErrors.slug ? 'true' : 'false'}
		/>
		{#if fieldErrors.slug}
			<span class={styles.fieldError}>{fieldErrors.slug}</span>
		{/if}
		<p class={styles.helpText}>
			Canonical URL is derived automatically from NEXT_PUBLIC_SITE_URL and this slug.
		</p>
	</label>

	<label class={styles.field}>
		<span>Excerpt</span>
		<textarea name="excerpt" rows={3} value={values.excerpt || ''} />
	</label>

	<label class={styles.field}>
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
			<span class={styles.fieldError}>{fieldErrors.content}</span>
		{/if}
	</label>

	<section class={styles.preview} aria-label="Markdown preview">
		<div class={styles.previewHeader}>
			<h2>Preview</h2>
			<p>Rendered with the same MarkdownContent component used on public posts.</p>
		</div>
		<div class={styles.previewBody}>
			{#if previewContent}
				<MarkdownContent content={previewContent} />
			{:else}
				<p>Start writing to see a live preview.</p>
			{/if}
		</div>
	</section>

	<label class={styles.field}>
		<span>Status</span>
		<select name="status" value={values.status || 'DRAFT'}>
			<option value="DRAFT">Draft</option>
			<option value="SCHEDULED">Scheduled</option>
			<option value="PUBLISHED">Published</option>
			<option value="ARCHIVED">Archived</option>
		</select>
		<p class={styles.helpText}>
			Drafts remain available only on their direct blog URL. Archive a post to hide it completely.
		</p>
	</label>

	<label class={styles.field}>
		<span>Schedule for</span>
		<input
			type="datetime-local"
			name="scheduledFor"
			value={values.scheduledFor || ''}
			aria-invalid={fieldErrors.scheduledFor ? 'true' : 'false'}
		/>
		<p class={styles.helpText}>
			Stored using Temporal and interpreted as {CMS_TIME_ZONE}.
		</p>
		{#if fieldErrors.scheduledFor}
			<span class={styles.fieldError}>{fieldErrors.scheduledFor}</span>
		{/if}
	</label>

	<label class={styles.field}>
		<span>Cover image URL</span>
		<input
			type="url"
			name="coverImageUrl"
			value={values.coverImageUrl || ''}
		/>
		<p class={styles.helpText}>Only absolute external image URLs are supported.</p>
	</label>

	<label class={styles.field}>
		<span>Cover image alt text</span>
		<input
			type="text"
			name="coverImageAlt"
			value={values.coverImageAlt || ''}
		/>
		{#if fieldErrors.coverImageAlt}
			<span class={styles.fieldError}>{fieldErrors.coverImageAlt}</span>
		{/if}
	</label>

	<button type="submit" class={styles.submitButton} disabled={pending}>
		{pending ? 'Saving...' : submitLabel}
	</button>
</form>
