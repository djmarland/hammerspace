<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		startRegistration,
		verifyRegistration,
		isWebAuthnSupported
	} from '@/lib/webauthn-client';

	interface Props {
		hasPasskey: boolean;
	}

	const { hasPasskey }: Props = $props();

	let supported = $state(false);
	let loading = $state(false);
	let error = $state('');
	let completed = $state(false);

	$effect(() => {
		void (async () => {
			supported = await isWebAuthnSupported();
		})();
	});

	async function handleRegisterPasskey() {
		error = '';
		loading = true;

		try {
			const credential = await startRegistration();
			await verifyRegistration(credential);
			completed = true;
			await goto('/admin');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to register passkey';
		} finally {
			loading = false;
		}
	}
</script>

{#if !hasPasskey && !completed}
	<div class="container">
		{#if !supported}
			<div class="warning">
				<p>WebAuthn is not supported on this device or browser.</p>
			</div>
		{:else}
			<div class="card">
				<h2>Secure Your Account with a Passkey</h2>
				<p>
					You can now secure your account with a passkey instead of a password.
					This is more secure and easier to use.
				</p>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<button
					onclick={handleRegisterPasskey}
					disabled={loading}
					class="button"
				>
					{loading ? 'Setting up passkey...' : 'Add Passkey'}
				</button>

				<p class="skip">
					You can skip this for now, but we recommend setting up a passkey.
				</p>
			</div>
		{/if}
	</div>
{/if}

<style>
	.container {
		padding: var(--piko-space-6) var(--piko-space-4);
		max-width: 500px;
		margin: 0 auto;
	}

	.card {
		background: var(--piko-color-surface);
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		padding: var(--piko-space-6);
		box-shadow: var(--piko-shadow-1);
	}

	.card h2 {
		margin-top: 0;
		font-size: 1.5rem;
	}

	.card p {
		color: var(--piko-color-text-muted);
		line-height: 1.6;
	}

	.error {
		background-color: var(--piko-color-error-bg);
		border: 1px solid var(--piko-color-error-border);
		color: var(--piko-color-error-text);
		padding: var(--piko-space-3) var(--piko-space-4);
		border-radius: 0;
		margin-bottom: 1rem;
	}

	.button {
		width: 100%;
		padding: var(--piko-space-control-padding-y) var(--piko-space-control-padding-x);
		background-color: var(--piko-color-primary-bg);
		color: var(--piko-color-primary-text);
		border: 1px solid var(--piko-color-primary-border);
		border-radius: 0;
		font-size: 1rem;
		cursor: pointer;
		margin-top: 1.5rem;
		transition: background-color 0.2s;
	}

	.button:hover:not(:disabled) {
		background-color: var(--piko-color-primary-border);
	}

	.button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.warning {
		background-color: var(--piko-color-warning-bg);
		border: 1px solid var(--piko-color-warning-border);
		color: var(--piko-color-warning-text);
		padding: var(--piko-space-4);
		border-radius: 0;
	}

	.skip {
		margin-top: 1rem;
		font-size: 0.875rem;
		color: var(--piko-color-text-muted);
		text-align: center;
	}
</style>
