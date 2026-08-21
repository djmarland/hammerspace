<script lang="ts">
	import { resolve } from "$app/paths";
	import Logo from "@/components/Atoms/Logo/Logo.svelte";

	type Props = { title: string };
	let { title }: Props = $props();
</script>

<header class="header">
	<div class="logo">
		<a href={resolve("/")}>
			<Logo />
		</a>
	</div>
	<h1 class="piko-type-h1">{title}</h1>
	<slot />
</header>

<style>
	.logo,
	.logo a {
		display: block;
		width: min(100%, 120px);
	}

	.logo :global(svg),
	.logo a :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		max-width: 100%;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.85rem;
		text-align: right;
	}

	.header h1 {
		margin: 0;
	}
</style>
