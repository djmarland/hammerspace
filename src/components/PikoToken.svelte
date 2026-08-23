<script lang="ts">
	interface Props {
		token: string;
	}

	const { token }: Props = $props();

	const COPY_RESET_TIMEOUT_MS = 1500;

	let copyState = $state<"idle" | "copied" | "error">("idle");

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(token);
			copyState = "copied";
		} catch {
			copyState = "error";
		}

		setTimeout(() => {
			copyState = "idle";
		}, COPY_RESET_TIMEOUT_MS);
	}

	function handleTokenClick() {
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) return;
		void handleCopy();
	}

	function handleTokenKeydown(event: KeyboardEvent) {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		void handleCopy();
	}

	const copyLabel = $derived(copyState === "copied" ? "Copied" : "Copy token");
</script>

<span
	class="token"
	role="button"
	tabindex="0"
	onclick={handleTokenClick}
	onkeydown={handleTokenKeydown}
	aria-label={copyLabel}
>
	<code>{token}</code>
	<span class="icon" aria-hidden="true">
		{#if copyState === "copied"}
			<svg focusable="false" viewBox="0 0 24 24">
				<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
			</svg>
		{:else}
			<svg focusable="false" viewBox="0 0 24 24">
				<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"></path>
			</svg>
		{/if}
	</span>
</span>

<style>
	.token {
		cursor: pointer;
	}

	.token code {
		overflow-wrap: anywhere;
	}

	.icon {
		display: inline-flex;
		width: 0.8em;
		height: 0.8em;
		opacity: 0;
		transition: opacity 120ms ease;
	}

	.icon :global(svg) {
		fill: currentColor;
	}

	.token:hover .icon,
	.token:focus-visible .icon {
		opacity: 1;
	}

	.token:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
