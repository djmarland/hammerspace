"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
	startAuthentication,
	verifyAuthentication,
} from "@/lib/webauthn-client";
import styles from "./LoginForm.module.css";

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

/**
 * Fully client-driven login screen: attempts a passkey auto-login on mount,
 * and separately handles a `?token=...` one-time bootstrap login-token flow
 * (POSTing to `/api/auth/token-login`).
 */
export default function LoginForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [error, setError] = useState("");
	const [tokenLoading, setTokenLoading] = useState(false);
	const [passkeyLoading, setPasskeyLoading] = useState(false);
	const [autoAttempting, setAutoAttempting] = useState(false);
	const [tokenProcessed, setTokenProcessed] = useState(false);
	const [autoPrompted, setAutoPrompted] = useState(false);
	const [webauthnSupported, setWebauthnSupported] = useState(false);

	useEffect(() => {
		// Wrapped in an async IIFE (matching PasskeySetup's browser-capability
		// check) rather than calling setState as the effect's first
		// synchronous statement.
		void (async () => {
			setWebauthnSupported(
				window.isSecureContext && window.PublicKeyCredential !== undefined,
			);
		})();
	}, []);

	useEffect(() => {
		if (!token || tokenProcessed) {
			return;
		}

		let cancelled = false;

		async function loginWithToken() {
			setTokenLoading(true);
			setError("");

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
					// Hard navigation: a client-side router.replace can serve a
					// stale Router Cache entry for the target route that was
					// prefetched (and redirected to /admin/login) while we were
					// still unauthenticated. A full navigation always re-fetches
					// with the now-valid session cookie.
					window.location.href = data.redirectTo || "/admin";
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Token login failed");
				}
			} finally {
				if (!cancelled) {
					setTokenLoading(false);
					setTokenProcessed(true);
				}
			}
		}

		void loginWithToken();

		return () => {
			cancelled = true;
		};
	}, [token, tokenProcessed]);

	async function handlePasskeyLogin(source: "auto" | "manual") {
		setError("");

		if (source === "manual") {
			setPasskeyLoading(true);
		} else {
			setAutoAttempting(true);
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
			// See the token-login redirect above for why this is a hard
			// navigation rather than router.push.
			window.location.href = "/admin";
		} catch (err) {
			console.error("Passkey login failed", err);
			if (err instanceof Error && err.message === "WebAuthn not supported") {
				setError(
					"Passkey login is unavailable in this browser. Try a recent version of Safari, Chrome, or Edge.",
				);
			} else {
				setError(
					err instanceof Error ? err.message : "Passkey authentication failed",
				);
			}
		} finally {
			if (source === "manual") {
				setPasskeyLoading(false);
			} else {
				setAutoAttempting(false);
			}
		}
	}

	useEffect(() => {
		if (token || autoPrompted) {
			return;
		}

		// Wrapped in an async IIFE so the `setAutoPrompted` call isn't the
		// effect's first synchronous statement (see the webauthnSupported
		// effect above for the same reasoning).
		void (async () => {
			setAutoPrompted(true);
			await handlePasskeyLogin("auto");
		})();
	}, [token, autoPrompted]);

	return (
		<div className={styles.container}>
			<div className="piko-vstack">
				<h1 className="piko-t-h1">Login</h1>

				{error && (
					<div data-state="error" className="piko-state__box">
						{error}
					</div>
				)}

				{token ? (
					<p data-state="info" className="piko-state__box">
						{tokenLoading
							? "Verifying login token..."
							: "Token login attempted."}
					</p>
				) : (
					<>
						{autoAttempting && (
							<p data-state="info" className="piko-state__box">
								Attempting automatic passkey login...
							</p>
						)}

						<button
							type="button"
							onClick={() => void handlePasskeyLogin("manual")}
							className="piko-button--primary"
							disabled={passkeyLoading}
						>
							{passkeyLoading ? "Authenticating..." : "Retry Passkey Login"}
						</button>

						{!webauthnSupported && (
							<p data-state="warning" className="piko-state__box">
								This browser may report limited WebAuthn support, but you can
								still try passkey login manually.
							</p>
						)}
					</>
				)}
			</div>
		</div>
	);
}
