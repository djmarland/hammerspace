<script>
    import Footer from "@/components/Organisms/Footer/Footer.svelte";
</script>

<div class="site-template">
	<header data-theme="dark">
		<div class="header-content"><slot name="header" /></div>
	</header>
	<div class="content-column">
		<main><slot /></main>
		<Footer />
	</div>
</div>

<style>
	.site-template {
		display: grid;
		min-height: 100vh;
		grid-template-columns: 5fr 7fr;
	}
	header {
		background-color: color-mix(in srgb, var(--piko-palette-dynamic-8) 10%, var(--piko-color-background) 90%);
	}
	.header-content {
		position: sticky;
		top: 0;
		height: 100vh;
		padding: var(--piko-unit-double);
		place-content: center;
	}
	.content-column {
		margin-top: 30vh;
	}
	main {
		max-width: 75ch;
		padding: var(--piko-unit-double);
	}
</style>
