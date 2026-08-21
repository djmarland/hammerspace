<script>
    import Footer from "@/components/Organisms/Footer/Footer.svelte";
</script>

<div class="site-template">
	<header>
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
		overflow: clip;
	}
	.header-content {
		position: sticky;
		top: 0;
		height: 100vh;
		width: min(100%, 400px);
		margin-left: auto;
		padding: var(--piko-unit-double);
		display: grid;
		align-content: center;
		view-transition-name: site-header-content;
	}
	.content-column {
		margin-top: 30vh;
		view-transition-name: site-content;
		overflow: clip;
	}
	main {
		max-width: 75ch;
		padding: var(--piko-unit-double);
	}
</style>
