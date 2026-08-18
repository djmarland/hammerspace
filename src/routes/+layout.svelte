<script lang="ts">
	let { data } = $props();
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
