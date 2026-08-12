<script lang="ts">
	import styles from './PaginationNav.module.css';

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
	<nav class={styles.nav} aria-label="Pagination">
		<a
			href={buildHref(Math.max(1, page - 1))}
			class={styles.link}
			aria-disabled={page === 1}
			tabindex={page === 1 ? -1 : undefined}
		>
			← Previous
		</a>
		<div class={styles.pages}>
			{#each pages as value, index}
				{@const previousValue = pages[index - 1]}
				{@const showGap = previousValue && value - previousValue > 1}
				<span class={styles.pageGroup}>
					{#if showGap}
						<span class={styles.gap}>…</span>
					{/if}
					<a
						href={buildHref(value)}
						class={value === page ? styles.currentPage : styles.link}
						aria-current={value === page ? 'page' : undefined}
					>
						{value}
					</a>
				</span>
			{/each}
		</div>
		<a
			href={buildHref(Math.min(totalPages, page + 1))}
			class={styles.link}
			aria-disabled={page === totalPages}
			tabindex={page === totalPages ? -1 : undefined}
		>
			Next →
		</a>
	</nav>
{/if}
