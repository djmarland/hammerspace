<script lang="ts">
	interface Props {
		page: number;
		totalPages: number;
		buildHref: (page: number) => string;
	}

	const { page, totalPages, buildHref }: Props = $props();

	function buildPageList(page: number, totalPages: number) {
		const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
		return [...pages]
			.filter((value) => value >= 1 && value <= totalPages)
			.sort((a, b) => a - b);
	}

	const pages = $derived(buildPageList(page, totalPages));
</script>

{#if totalPages > 1}
	<nav class="nav" aria-label="Pagination">
		<a
			href={buildHref(Math.max(1, page - 1))}
			class="link"
			aria-disabled={page === 1}
			tabindex={page === 1 ? -1 : undefined}
		>
			← Previous
		</a>
		<div class="pages">
			{#each pages as value, index}
				{@const previousValue = pages[index - 1]}
				{@const showGap = previousValue && value - previousValue > 1}
				<span class="pageGroup">
					{#if showGap}
						<span class="gap">…</span>
					{/if}
					<a
						href={buildHref(value)}
						class={value === page ? "currentPage" : "link"}
						aria-current={value === page ? 'page' : undefined}
					>
						{value}
					</a>
				</span>
			{/each}
		</div>
		<a
			href={buildHref(Math.min(totalPages, page + 1))}
			class="link"
			aria-disabled={page === totalPages}
			tabindex={page === totalPages ? -1 : undefined}
		>
			Next →
		</a>
	</nav>
{/if}

<style>
	.nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.pages {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.pageGroup {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.link,
	.currentPage {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.5rem;
		padding: 0.55rem 0.8rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 999px;
		text-decoration: none;
	}

	.currentPage {
		background: color-mix(in srgb, currentColor 12%, transparent);
		font-weight: 700;
	}

	.link[aria-disabled="true"] {
		pointer-events: none;
		opacity: 0.45;
	}

	.gap {
		opacity: 0.7;
	}
</style>
