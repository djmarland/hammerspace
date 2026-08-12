<script lang="ts">
	interface Props {
		token: string;
	}

	const { token }: Props = $props();

	const COPY_RESET_TIMEOUT_MS = 1500;

	let copyState = $state<'idle' | 'copied' | 'error'>('idle');
	let statusId = `token-status-${Math.random().toString(36).substr(2, 9)}`;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(token);
			copyState = 'copied';
		} catch {
			copyState = 'error';
		}

		setTimeout(() => {
			copyState = 'idle';
		}, COPY_RESET_TIMEOUT_MS);
	}

	const copyLabel = copyState === 'copied' ? 'Copied' : 'Copy';
	const statusText =
		copyState === 'copied'
			? `Copied ${token} to clipboard.`
			: copyState === 'error'
				? 'Copy failed.'
				: '';
</script>

<span class="token">
	<code>{token}</code>
	<button
		type="button"
		class="copyButton"
		onclick={handleCopy}
		aria-label={`Copy ${token} to clipboard`}
		aria-describedby={statusId}
	>
		{copyLabel}
	</button>
	<span
		id={statusId}
		class="visuallyHidden"
		role="status"
		aria-live="polite"
	>
		{statusText}
	</span>
</span>

<style>
	.token {
		display: inline-flex;
		align-items: center;
		gap: var(--piko-space-2);
		max-width: 100%;
	}

	.token code {
		overflow-wrap: anywhere;
	}

	.copyButton {
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font: inherit;
		line-height: 1;
		padding: 0.2rem 0.4rem;
		opacity: 0;
		pointer-events: none;
		transition: opacity 120ms ease;
	}

	.token:hover .copyButton,
	.token:focus-within .copyButton,
	.copyButton:focus-visible {
		opacity: 1;
		pointer-events: auto;
	}

	.visuallyHidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
