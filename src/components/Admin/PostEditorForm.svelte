<script lang="ts">
	import MarkdownContent from "../Blog/MarkdownContent.svelte";
	import { postSchema } from "@/lib/post-form";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import type { SuperValidated, Infer } from "sveltekit-superforms";

	interface Props {
		action?: string;
		submitLabel: string;
		tags: { id: string; name: string }[];
		data: SuperValidated<Infer<typeof postSchema>>;
	}

	const { action = "", submitLabel, tags, data }: Props = $props();

	const { form, errors, message, enhance, submitting, allErrors } = superForm(
		data,
		{
			// Run the same Zod schema client-side for immediate inline feedback.
			validators: zod4Client(postSchema),
			validationMethod: "auto",
			resetForm: false,
			taintedMessage: false,
		},
	);

	let previewContent = $state($form.content || "");
</script>

<form class="form" method="POST" action={action || undefined} use:enhance>
	<div class="piko-page-container">
		{#if $message}
			<p class="error">{$message}</p>
		{:else if $allErrors.length > 0}
			<p class="error">Please fix the highlighted fields.</p>
		{/if}

		<label class="field">
			<span>Title</span>
			<input
				type="text"
				name="title"
				required
				bind:value={$form.title}
				aria-invalid={$errors.title ? "true" : "false"}
			/>
			{#if $errors.title}
				<span class="fieldError">{$errors.title}</span>
			{/if}
		</label>

		{#if tags.length > 0}
			<fieldset class="fieldset">
				<legend>Tags</legend>
				<div class="tagGrid">
					{#each tags as tag (tag.id)}
						<label class="checkboxField">
							<input
								type="checkbox"
								name="tagIds"
								value={tag.id}
								bind:group={$form.tagIds}
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
				bind:value={$form.slug}
				aria-invalid={$errors.slug ? "true" : "false"}
			/>
			{#if $errors.slug}
				<span class="fieldError">{$errors.slug}</span>
			{/if}
		</label>

		<label class="field">
			<span>Excerpt</span>
			<textarea name="excerpt" rows={3} bind:value={$form.excerpt}></textarea>
		</label>
	</div>
	<div class="editor piko-vstack--small">
		<label for="content"> Content (Markdown) </label>
		{#if $errors.content}
			<p class="fieldError">{$errors.content}</p>
		{/if}
		<div class="editor-grid">
			<textarea
				id="content"
				name="content"
				rows={14}
				required
				bind:value={$form.content}
				oninput={(e) => (previewContent = e.currentTarget.value)}
				aria-invalid={$errors.content ? "true" : "false"}
			></textarea>
			<section class="preview" aria-label="Markdown preview">
				<div class="piko-prose">
					{#if previewContent}
						<MarkdownContent content={previewContent} />
					{:else}
						<p>Start writing to see a live preview.</p>
					{/if}
				</div>
			</section>
		</div>
	</div>

	<div class="piko-page-container">
		<label class="field">
			<span>Cover image URL</span>
			<input
				type="url"
				name="coverImageUrl"
				bind:value={$form.coverImageUrl}
				aria-invalid={$errors.coverImageUrl ? "true" : "false"}
			/>
			<p class="helpText">Only absolute external image URLs are supported.</p>
			{#if $errors.coverImageUrl}
				<span class="fieldError">{$errors.coverImageUrl}</span>
			{/if}
		</label>

		<label class="field">
			<span>Cover image alt text</span>
			<input
				type="text"
				name="coverImageAlt"
				bind:value={$form.coverImageAlt}
				aria-invalid={$errors.coverImageAlt ? "true" : "false"}
			/>
			{#if $errors.coverImageAlt}
				<span class="fieldError">{$errors.coverImageAlt}</span>
			{/if}
		</label>

		<div class="actions">
			<div class="piko-page-container actions__inner">
				<button type="submit" class="submitButton" disabled={$submitting}>
					{$submitting ? "Saving..." : submitLabel}
				</button>
			</div>
		</div>
	</div>
</form>

<style>
	.editor {
		padding-inline: var(--piko-page-gutter);
	}

	.editor-grid {
		display: grid;
		gap: var(--piko-gap-grid);
	}

	@media (min-width: 800px) {
		.editor-grid {
			grid-template-columns: 1fr 1fr;
			height: 80vh;

			textarea {
				height: 100%;
			}
		}
	}

	.preview {
		border: 1px solid var(--piko-color-border);
		padding: var(--piko-space-panel-padding);
		height: 100%;
		overflow-y: auto;
	}

	.form {
		display: grid;
		gap: 1.25rem;
		margin-bottom: var(--piko-unit-quad);
	}

	.field,
	.fieldset {
		display: grid;
		gap: 0.45rem;
	}

	.fieldset {
		padding: 1rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
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

	.helpText {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
		font-size: 0.95rem;
	}

	.error {
		margin: 0;
		color: #c10f0f;
		font-weight: 600;
	}

	.actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--piko-color-background);
		padding-block: var(--piko-unit);
		border-top: solid 1px var(--piko-color-border);
	}

	.actions__inner {
		display: flex;
		justify-content: end;
	}
</style>
