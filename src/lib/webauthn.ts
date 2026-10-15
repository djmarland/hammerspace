import type { AuthenticatorTransport } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { nowDate } from "@/lib/temporal";
import crypto from "crypto";

const CHALLENGE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

function generateChallenge(): string {
	return crypto.randomBytes(32).toString("base64url");
}

export async function generateAndStoreChallenge(
	userId: string,
): Promise<string> {
	const challenge = generateChallenge();
	await storeChallenge(userId, challenge);
	return challenge;
}

export async function storeChallenge(
	userId: string,
	challenge: string,
): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			webauthnChallenge: challenge,
			webauthnChallengeExpiresAt: new Date(
				nowDate().getTime() + CHALLENGE_EXPIRATION_MS,
			),
		},
	});
}

// At sign-in we don't know which user is signing in until their passkey
// responds, so the challenge is stored on every user who has a passkey.
// verify-authenticate then checks it against the passkey owner's copy.
export async function storeSignInChallenge(challenge: string): Promise<void> {
	await prisma.user.updateMany({
		where: { credentials: { some: {} } },
		data: {
			webauthnChallenge: challenge,
			webauthnChallengeExpiresAt: new Date(
				nowDate().getTime() + CHALLENGE_EXPIRATION_MS,
			),
		},
	});
}

// Clears a used sign-in challenge from every user it was stored on, so it
// can't be replayed against another user's passkey.
export async function clearSignInChallenge(challenge: string): Promise<void> {
	await prisma.user.updateMany({
		where: { webauthnChallenge: challenge },
		data: {
			webauthnChallenge: null,
			webauthnChallengeExpiresAt: null,
		},
	});
}

export async function getAndValidateChallenge(
	userId: string,
): Promise<string | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			webauthnChallenge: true,
			webauthnChallengeExpiresAt: true,
		},
	});

	if (!user?.webauthnChallenge || !user.webauthnChallengeExpiresAt) {
		return null;
	}

	if (nowDate() > user.webauthnChallengeExpiresAt) {
		// Clear expired challenge
		await prisma.user.update({
			where: { id: userId },
			data: {
				webauthnChallenge: null,
				webauthnChallengeExpiresAt: null,
			},
		});
		return null;
	}

	return user.webauthnChallenge;
}

export async function clearChallenge(userId: string): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			webauthnChallenge: null,
			webauthnChallengeExpiresAt: null,
		},
	});
}

export function credentialIdToBase64url(
	credentialId: Buffer | Uint8Array,
): string {
	const bytes = Buffer.from(credentialId);
	const legacyValue = bytes.toString("utf8");

	if (isLikelyBase64url(legacyValue)) {
		return legacyValue;
	}

	return bytes.toString("base64url");
}

export function credentialIdFromBase64url(
	credentialId: string,
): Uint8Array<ArrayBuffer> {
	return toStrictUint8Array(Buffer.from(credentialId, "base64url"));
}

export function credentialIdFromLegacyBase64urlString(
	credentialId: string,
): Uint8Array<ArrayBuffer> {
	return toStrictUint8Array(Buffer.from(credentialId, "utf8"));
}

// WebAuthnCredential.transports is stored as a comma-separated string, since
// SQLite has no array columns.
export function serializeTransports(transports: string[]): string {
	return transports.join(",");
}

export function parseTransports(transports: string): AuthenticatorTransport[] {
	return transports.split(",").filter(Boolean) as AuthenticatorTransport[];
}

function isLikelyBase64url(value: string): boolean {
	if (value.length < 16 || !BASE64URL_PATTERN.test(value)) {
		return false;
	}

	try {
		return Buffer.from(value, "base64url").toString("base64url") === value;
	} catch {
		return false;
	}
}

function toStrictUint8Array(bytes: Buffer): Uint8Array<ArrayBuffer> {
	const arrayBuffer = new ArrayBuffer(bytes.length);
	const array: Uint8Array<ArrayBuffer> = new Uint8Array(arrayBuffer);
	array.set(bytes);
	return array;
}
