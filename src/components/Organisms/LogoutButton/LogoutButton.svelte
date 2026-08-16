<script lang="ts">
</script>

<form action="/api/auth/logout" method="POST">
	<button type="submit" class="logout"> Logout </button>
</form>

<style>
	.logout {
		padding: var(--piko-space-control-padding-y)
			var(--piko-space-control-padding-x);
		border: 1px solid var(--piko-color-danger-border);
		border-radius: 0;
		background-color: var(--piko-color-danger-bg);
		color: var(--piko-color-danger-text);
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.logout:hover {
		background-color: var(--piko-color-danger-border);
		border-color: var(--piko-color-danger-border);
	}
</style>
