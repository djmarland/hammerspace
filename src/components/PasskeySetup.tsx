"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	isWebAuthnSupported,
	startRegistration,
	verifyRegistration,
} from "@/lib/webauthn-client";

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
		void (async () => {
			setSupported(await isWebAuthnSupported());
		})();
	}, []);

	async function handleRegisterPasskey() {
		setError("");
		setLoading(true);

		try {
			const credential = await startRegistration();
			await verifyRegistration(credential);
			setCompleted(true);
			router.push("/admin");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to register passkey",
			);
		} finally {
			setLoading(false);
		}
	}

	if (hasPasskey || completed) {
		return null;
	}

	if (!supported) {
		return (
			<p className="piko-state__box" data-state="warning">
				WebAuthn is not supported on this device or browser.
			</p>
		);
	}

	return (
		<section className="piko-card piko-vstack">
			<h2 className="piko-t-h2">Secure Your Account with a Passkey</h2>
			<p>
				You can now secure your account with a passkey instead of a password.
				This is more secure and easier to use.
			</p>

			{error && (
				<p className="piko-state__box" data-state="error">
					{error}
				</p>
			)}

			<button
				onClick={handleRegisterPasskey}
				disabled={loading}
				className="piko-button--primary"
			>
				{loading ? "Setting up passkey..." : "Add Passkey"}
			</button>

			<p className="piko-t-meta">
				You can skip this for now, but we recommend setting up a passkey.
			</p>
		</section>
	);
}
