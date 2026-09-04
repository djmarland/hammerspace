<script lang="ts">
    import Masthead from "@/components/Organisms/Masthead/Masthead.svelte";

    let { children } = $props();
</script>

<div class="admin-shell">
	<Masthead />
    {@render children?.()}
</div>

<style>
	.admin-shell {
		display: grid;
		grid-template-rows: auto 1fr;
		padding-bottom: 100px;
	}
</style>
