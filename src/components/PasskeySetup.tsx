"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	startRegistration,
	verifyRegistration,
	isWebAuthnSupported,
} from "@/lib/webauthn-client";
import styles from "./PasskeySetup.module.css";

interface PasskeySetupProps {
	hasPasskey: boolean;
}

export default function PasskeySetup({ hasPasskey }: PasskeySetupProps) {
	const router = useRouter();
	const [supported, setSupported] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [completed, setCompleted] = useState(false);

	useEffect(() => {
		isWebAuthnSupported().then(setSupported);
	}, []);

	// Don't show if user already has a passkey
	if (hasPasskey || completed) {
		return null;
	}

	if (!supported) {
		return (
			<div className={styles.container}>
				<div className={styles.warning}>
					<p>WebAuthn is not supported on this device or browser.</p>
				</div>
			</div>
		);
	}

	const handleRegisterPasskey = async () => {
		setError("");
		setLoading(true);

		try {
			const credential = await startRegistration();
			await verifyRegistration(credential);
			setCompleted(true);
			router.replace("/admin");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to register passkey",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h2>Secure Your Account with a Passkey</h2>
				<p>
					You can now secure your account with a passkey instead of a password.
					This is more secure and easier to use.
				</p>

				{error && <div className={styles.error}>{error}</div>}

				<button
					onClick={handleRegisterPasskey}
					disabled={loading}
					className={styles.button}
				>
					{loading ? "Setting up passkey..." : "Add Passkey"}
				</button>

				<p className={styles.skip}>
					You can skip this for now, but we recommend setting up a passkey.
				</p>
			</div>
		</div>
	);
}
