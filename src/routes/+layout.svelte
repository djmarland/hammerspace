<script lang="ts">
	import Masthead from '@/components/Organisms/Masthead/Masthead.svelte';
	import Footer from '@/components/Organisms/Footer/Footer.svelte';
</script>

<div class="app-shell">
	<Masthead />
	<slot />
	<Footer />
</div>

<style>
	.app-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
