<script lang="ts">
	interface Props {
		label: string;
		confirmMessage: string;
		className?: string;
	}

	const { label, confirmMessage, className }: Props = $props();

	let pending = $state(false);

	function handleClick(event: MouseEvent) {
		if (pending) {
			return;
		}
		if (!window.confirm(confirmMessage)) {
			event.preventDefault();
		}
	}
</script>

<button
	type="submit"
	class={className}
	disabled={pending}
	onclick={handleClick}
>
	{pending ? 'Working...' : label}
</button>
