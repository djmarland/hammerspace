<script lang="ts">
    import {resolve} from "$app/paths";
    import {formatDateTimeLocalValue, formatSlugDateSuffix, parseDateTimeLocalAsDate,} from "@/lib/temporal";
    import {publishSchema} from "@/lib/post-form";
    import {superForm} from "sveltekit-superforms";
    import {zod4Client} from "sveltekit-superforms/adapters";
    import type {PageData} from "./$types";

    interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const { form, errors, message, enhance, submitting } = superForm(data.form, {
		validators: zod4Client(publishSchema),
		validationMethod: "auto",
		resetForm: false,
		taintedMessage: false,
	});

	function setToNow() {
		$form.publishedAt = formatDateTimeLocalValue(new Date());
	}

	// The "-mm-yyyy" suffix is only appended the first time a post is
	// published, so only preview it while the post is still a Draft.
	let isFirstPublish = $derived(!data.post.publishedAt);

	let previewSlug = $derived.by(() => {
		if (!isFirstPublish) {
			return $form.slug;
		}
		const publishDate = parseDateTimeLocalAsDate($form.publishedAt);
		if (!publishDate) {
			return $form.slug;
		}
		return `${$form.slug}${formatSlugDateSuffix(publishDate)}`;
	});
</script>

<svelte:head>
	<title>Publish: {data.post.title}</title>
</svelte:head>

<div class="piko-page-container piko-vstack">
	<h1 class="piko-t-h1">Publish "{data.post.title}"</h1>

	<p>
		{#if data.post.publishedAt}
			This post is already published. Choose a new date/time below to reschedule
			it.
		{:else}
			Choose the date and time this post should go live. The slug will be
			updated with a "-mm-yyyy" suffix based on this date once you publish.
		{/if}
	</p>

	<form method="POST" action="?/publish" use:enhance>
		{#if $message}
			<p class="error">{$message}</p>
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
			<code>{previewSlug}</code>

		<label class="field">
			<span>Publish at</span>
			<div class="piko-hstack">
				<input
					type="datetime-local"
					name="publishedAt"
					bind:value={$form.publishedAt}
					aria-invalid={$errors.publishedAt ? "true" : "false"}
				/>
				<button type="button" onclick={setToNow}>Set to now</button>
			</div>
			{#if $errors.publishedAt}
				<span class="fieldError">{$errors.publishedAt}</span>
			{/if}
		</label>

		<div class="piko-hstack">
			<button class="piko-button--primary" type="submit" disabled={$submitting}>
				{$submitting ? "Publishing..." : "Publish"}
			</button>
			<a class="piko-button" href={resolve(`/admin/posts/${data.post.id}/edit`)}>Cancel</a>
		</div>
	</form>
</div>

<style>
	.field {
		display: grid;
		gap: 0.45rem;
	}

	.slug-preview {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		color: var(--piko-color-text-subtle);
	}

	.slug-preview code {
		font-family: monospace;
		color: var(--piko-color-text);
	}

	.fieldError {
		color: #c10f0f;
		font-size: 0.9rem;
	}

	.error {
		margin: 0;
		color: #c10f0f;
		font-weight: 600;
	}
</style>
