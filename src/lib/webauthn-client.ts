import { startAuthentication as startBrowserAuthentication } from "@simplewebauthn/browser";
import { startRegistration as startBrowserRegistration } from "@simplewebauthn/browser";

type RegistrationResponse = Awaited<
	ReturnType<typeof startBrowserRegistration>
>;
type AuthenticationResponse = Awaited<
	ReturnType<typeof startBrowserAuthentication>
>;

export async function startRegistration() {
	const response = await fetch("/api/auth/webauthn/register-options", {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error("Failed to get registration options");
	}

	const options = await response.json();

	if (!window.PublicKeyCredential) {
		throw new Error("WebAuthn not supported");
	}

	return startBrowserRegistration({
		optionsJSON: options,
	});
}

export async function verifyRegistration(credential: RegistrationResponse) {
	const response = await fetch("/api/auth/webauthn/verify-register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(credential),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to verify credential");
	}

	const result = await response.json();
	return result;
}

export async function startAuthentication() {
	const response = await fetch("/api/auth/webauthn/authenticate-options", {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error("Failed to get authentication options");
	}

	const options = await response.json();

	if (!window.PublicKeyCredential) {
		throw new Error("WebAuthn not supported");
	}

	return startBrowserAuthentication({
		optionsJSON: options,
	});
}

export async function verifyAuthentication(assertion: AuthenticationResponse) {
	const response = await fetch("/api/auth/webauthn/verify-authenticate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(assertion),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to verify assertion");
	}

	const result = await response.json();
	return result;
}

export async function isWebAuthnSupported(): Promise<boolean> {
	return (
		window.PublicKeyCredential !== undefined &&
		(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
	);
}
