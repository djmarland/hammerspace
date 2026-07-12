"use client";

export function credentialToJSON(credential: PublicKeyCredential) {
	if (credential.response instanceof AuthenticatorAssertionResponse) {
		return {
			id: credential.id,
			rawId: bufferToBase64URL(credential.rawId),
			response: {
				clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
				authenticatorData: bufferToBase64URL(
					credential.response.authenticatorData,
				),
				signature: bufferToBase64URL(credential.response.signature),
				userHandle: credential.response.userHandle
					? bufferToBase64URL(credential.response.userHandle)
					: null,
			},
			type: credential.type,
		};
	}

	if (credential.response instanceof AuthenticatorAttestationResponse) {
		return {
			id: credential.id,
			rawId: bufferToBase64URL(credential.rawId),
			response: {
				clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
				attestationObject: bufferToBase64URL(
					credential.response.attestationObject,
				),
				transports: credential.response.getTransports?.() || [],
			},
			type: credential.type,
		};
	}

	return null;
}

function bufferToBase64URL(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}
