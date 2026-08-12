<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		startRegistration,
		verifyRegistration,
		isWebAuthnSupported
	} from '@/lib/webauthn-client';
	import styles from './PasskeySetup.module.css';

	interface Props {
		hasPasskey: boolean;
	}

	const { hasPasskey }: Props = $props();

	let supported = $state(false);
	let loading = $state(false);
	let error = $state('');
	let completed = $state(false);

	$effect(async () => {
		supported = await isWebAuthnSupported();
	});

	// Don't show if user already has a passkey
	if (hasPasskey || completed) {
		$effect.pre(() => null);
	}

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
	<div class={styles.container}>
		{#if !supported}
			<div class={styles.warning}>
				<p>WebAuthn is not supported on this device or browser.</p>
			</div>
		{:else}
			<div class={styles.card}>
				<h2>Secure Your Account with a Passkey</h2>
				<p>
					You can now secure your account with a passkey instead of a password.
					This is more secure and easier to use.
				</p>

				{#if error}
					<div class={styles.error}>{error}</div>
				{/if}

				<button
					onclick={handleRegisterPasskey}
					disabled={loading}
					class={styles.button}
				>
					{loading ? 'Setting up passkey...' : 'Add Passkey'}
				</button>

				<p class={styles.skip}>
					You can skip this for now, but we recommend setting up a passkey.
				</p>
			</div>
		{/if}
	</div>
{/if}
