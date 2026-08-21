<script lang="ts">
	import { onNavigate } from '$app/navigation';

	declare global {
		interface Document {
			startViewTransition?: (
				updateCallback: () => Promise<void> | void
			) => { finished: Promise<void> };
		}
	}

	let { data } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise<void>((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	{@html `<style>:root { --piko-palette-dynamic-hue: ${data.dynamicHue}; }</style>`}
</svelte:head>

<div class="app-shell">
	<slot />
</div>

<style>
	.app-shell {
		min-height: 100vh;
		display: grid;
	}

	@media (max-width: 56rem) {
		::view-transition-old(root) {
			animation: mobile-view-fade-out 180ms ease both;
		}

		::view-transition-new(root) {
			animation: mobile-view-fade-in 180ms ease both;
		}
	}

	@keyframes mobile-view-fade-out {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes mobile-view-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
