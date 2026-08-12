<script lang="ts">
	import styles from './PikoToken.module.css';

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

<span class={styles.token}>
	<code>{token}</code>
	<button
		type="button"
		class={styles.copyButton}
		onclick={handleCopy}
		aria-label={`Copy ${token} to clipboard`}
		aria-describedby={statusId}
	>
		{copyLabel}
	</button>
	<span
		id={statusId}
		class={styles.visuallyHidden}
		role="status"
		aria-live="polite"
	>
		{statusText}
	</span>
</span>
