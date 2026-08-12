"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	startAuthentication,
	verifyAuthentication,
} from "@/lib/webauthn-client";
import styles from "./page.module.css";

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

export default function AdminLogin() {
	const [error, setError] = useState("");
	const [tokenLoading, setTokenLoading] = useState(false);
	const [passkeyLoading, setPasskeyLoading] = useState(false);
	const [autoAttempting, setAutoAttempting] = useState(false);
	const [webauthnSupported] = useState<boolean>(() => {
		if (typeof window === "undefined") {
			return false;
		}

		return window.isSecureContext && window.PublicKeyCredential !== undefined;
	});
	const [tokenProcessed, setTokenProcessed] = useState(false);
	const [token] = useState<string | null>(() => {
		if (typeof window === "undefined") {
			return null;
		}
		const params = new URLSearchParams(window.location.search);
		return params.get("token");
	});
	const router = useRouter();
	const autoPrompted = useRef(false);

	useEffect(() => {
		if (!token || tokenProcessed) {
			return;
		}

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
				router.replace(data.redirectTo || "/admin");
			} catch (err) {
				setError(err instanceof Error ? err.message : "Token login failed");
			} finally {
				setTokenLoading(false);
				setTokenProcessed(true);
			}
		}

		void loginWithToken();
	}, [token, tokenProcessed, router]);

	const handlePasskeyLogin = useCallback(async (source: "auto" | "manual") => {
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
			router.push("/admin");
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
	}, [router]);

	useEffect(() => {
		if (token || autoPrompted.current) {
			return;
		}
		autoPrompted.current = true;
		void handlePasskeyLogin("auto");
	}, [token, handlePasskeyLogin]);

	return (
		<div className={styles.container}>
			<div className={styles.form}>
				<h1>Admin Login</h1>

				{error && <div className={styles.error}>{error}</div>}

				{token ? (
					<p className={styles.demo}>
						{tokenLoading ? "Verifying login token..." : "Token login attempted."}
					</p>
				) : (
					<>
						<p className={styles.demo}>
							Passkey prompt should appear automatically. If it does not, use
							the button below.
						</p>
						{autoAttempting && (
							<p className={styles.demo}>Attempting automatic passkey login...</p>
						)}
						<button
							onClick={() => void handlePasskeyLogin("manual")}
							className={styles.passkeyButton}
							disabled={passkeyLoading}
						>
							{passkeyLoading ? "Authenticating..." : "Retry Passkey Login"}
						</button>
						{!webauthnSupported && (
							<p className={styles.demo}>
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
