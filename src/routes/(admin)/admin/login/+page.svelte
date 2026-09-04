<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import {
		startAuthentication,
		verifyAuthentication,
	} from "@/lib/webauthn-client";

	const PASSKEY_TIMEOUT_MS = 12000;

	function withTimeout<T>(
		promise: Promise<T>,
		timeoutMs: number,
		timeoutMessage: string,
	): Promise<T> {
		return new Promise((resolve, reject) => {
			const timeoutId = window.setTimeout(() => {
				reject(new Error(timeoutMessage));
			}, timeoutMs);

			promise
				.then((value) => {
					window.clearTimeout(timeoutId);
					resolve(value);
				})
				.catch((error: unknown) => {
					window.clearTimeout(timeoutId);
					reject(error);
				});
		});
	}

	let error = $state("");
	let tokenLoading = $state(false);
	let passkeyLoading = $state(false);
	let autoAttempting = $state(false);
	let tokenProcessed = $state(false);
	let autoPrompted = $state(false);

	const webauthnSupported = $derived(
		browser &&
			window.isSecureContext &&
			window.PublicKeyCredential !== undefined,
	);
	const token = $derived(page.url.searchParams.get("token"));

	$effect(() => {
		if (!token || tokenProcessed) {
			return;
		}

		let cancelled = false;

		async function loginWithToken() {
			tokenLoading = true;
			error = "";

			try {
				const response = await fetch("/api/auth/token-login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ token }),
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.error || "Invalid token");
				}

				const data = await response.json();
				if (!cancelled) {
					await goto(resolve(data.redirectTo || "/admin"), {
						replaceState: true,
					});
				}
			} catch (err) {
				if (!cancelled) {
					error = err instanceof Error ? err.message : "Token login failed";
				}
			} finally {
				if (!cancelled) {
					tokenLoading = false;
					tokenProcessed = true;
				}
			}
		}

		void loginWithToken();

		return () => {
			cancelled = true;
		};
	});

	async function handlePasskeyLogin(source: "auto" | "manual") {
		error = "";

		if (source === "manual") {
			passkeyLoading = true;
		} else {
			autoAttempting = true;
		}

		console.info("Starting passkey login attempt", { source });

		try {
			const assertion = await withTimeout(
				startAuthentication(),
				PASSKEY_TIMEOUT_MS,
				"Timed out waiting for passkey prompt. Try Retry Passkey Login.",
			);
			await withTimeout(
				verifyAuthentication(assertion),
				PASSKEY_TIMEOUT_MS,
				"Timed out verifying passkey response. Please retry.",
			);
			await goto(resolve("/admin"));
		} catch (err) {
			console.error("Passkey login failed", err);
			if (err instanceof Error && err.message === "WebAuthn not supported") {
				error =
					"Passkey login is unavailable in this browser. Try a recent version of Safari, Chrome, or Edge.";
			} else {
				error =
					err instanceof Error ? err.message : "Passkey authentication failed";
			}
		} finally {
			if (source === "manual") {
				passkeyLoading = false;
			} else {
				autoAttempting = false;
			}
		}
	}

	$effect(() => {
		if (token || autoPrompted) {
			return;
		}

		autoPrompted = true;
		void handlePasskeyLogin("auto");
	});
</script>

<svelte:head>
	<title>Admin Login</title>
</svelte:head>

<div class="container">
	<div class="form piko-vstack">
		<h1 class="piko-t-h1">Login</h1>

		{#if error}
			<div data-state="error" class="piko-state__box">{error}</div>
		{/if}

		{#if token}
			<p data-state="info" class="piko-state__box">
				{tokenLoading ? "Verifying login token..." : "Token login attempted."}
			</p>
		{:else}
			{#if autoAttempting}
				<p data-state="info" class="piko-state__box">
					Attempting automatic passkey login...
				</p>
			{/if}

			<button
				onclick={() => void handlePasskeyLogin("manual")}
				class="piko-button--primary"
				disabled={passkeyLoading}
			>
				{passkeyLoading ? "Authenticating..." : "Retry Passkey Login"}
			</button>

			{#if !webauthnSupported}
				<p data-state="warning" class="piko-state__box">
					This browser may report limited WebAuthn support, but you can still
					try passkey login manually.
				</p>
			{/if}
		{/if}
	</div>
</div>

<style>
	.container {
		text-align: center;
		padding: var(--piko-unit);
		max-width: 600px;
		margin-inline: auto;
	}
</style>
