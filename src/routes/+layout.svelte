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
</style>
