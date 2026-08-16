<script lang="ts">
	import Masthead from "@/components/Organisms/Masthead/Masthead.svelte";
</script>

<div class="admin-shell">
	<Masthead />
	<slot />
</div>

<style>
	.admin-shell {
		min-height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr;
	}
</style>
