"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	startAuthentication,
	verifyAuthentication,
	isWebAuthnSupported,
} from "@/lib/webauthn-client";
import styles from "./page.module.css";

export default function AdminLogin() {
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [webauthnSupported, setWebauthnSupported] = useState(false);
	const [tokenProcessed, setTokenProcessed] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const router = useRouter();
	const autoPrompted = useRef(false);

	useEffect(() => {
		isWebAuthnSupported().then(setWebauthnSupported);
	}, []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		setToken(params.get("token"));
	}, []);

	useEffect(() => {
		if (!token || tokenProcessed) {
			return;
		}

		async function loginWithToken() {
			setLoading(true);
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
				setLoading(false);
				setTokenProcessed(true);
			}
		}

		void loginWithToken();
	}, [token, tokenProcessed, router]);

	useEffect(() => {
		if (token || !webauthnSupported || autoPrompted.current) {
			return;
		}
		autoPrompted.current = true;
		void handlePasskeyLogin();
	}, [token, webauthnSupported]);

	async function handlePasskeyLogin() {
		setError("");
		setLoading(true);

		try {
			const assertion = await startAuthentication();
			await verifyAuthentication(assertion);
			router.push("/admin");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Passkey authentication failed",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.form}>
				<h1>Admin Login</h1>

				{error && <div className={styles.error}>{error}</div>}

				{token ? (
					<p className={styles.demo}>
						{loading ? "Verifying login token..." : "Token login attempted."}
					</p>
				) : webauthnSupported ? (
					<>
						<p className={styles.demo}>
							Passkey prompt should appear automatically.
						</p>
						<button
							onClick={handlePasskeyLogin}
							className={styles.passkeyButton}
							disabled={loading}
						>
							{loading ? "Authenticating..." : "Retry Passkey Login"}
						</button>
					</>
				) : (
					<p className={styles.error}>
						WebAuthn is not supported in this browser.
					</p>
				)}
			</div>
		</div>
	);
}
