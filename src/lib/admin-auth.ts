import crypto from "crypto";
import { prisma } from "@/lib/db";

export const ADMIN_AUTH_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 18 * 60 * 60;

interface AdminSessionPayload {
	sub: string;
	bootstrap: boolean;
	iat: number;
	exp: number;
}

export interface AdminSessionUser {
	userId: string;
	name: string | null;
	hasPasskey: boolean;
	bootstrap: boolean;
	loginTokenHash: string | null;
}

function getJwtSecret(): string {
	const secret = process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
	if (!secret) {
		throw new Error("Missing AUTH_JWT_SECRET (or NEXTAUTH_SECRET)");
	}
	return secret;
}

function base64urlEncode(value: string | Buffer): string {
	return Buffer.from(value).toString("base64url");
}

function base64urlDecodeToString(value: string): string {
	return Buffer.from(value, "base64url").toString("utf-8");
}

function createSignature(data: string): string {
	return crypto
		.createHmac("sha256", getJwtSecret())
		.update(data)
		.digest("base64url");
}

function parsePayload(token: string): AdminSessionPayload | null {
	const parts = token.split(".");
	if (parts.length !== 3) {
		return null;
	}

	const [headerPart, payloadPart, signaturePart] = parts;
	const signedData = `${headerPart}.${payloadPart}`;
	const expectedSignature = createSignature(signedData);
	const signatureBuffer = Buffer.from(signaturePart);
	const expectedBuffer = Buffer.from(expectedSignature);

	if (signatureBuffer.length !== expectedBuffer.length) {
		return null;
	}

	if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
		return null;
	}

	try {
		const header = JSON.parse(base64urlDecodeToString(headerPart)) as {
			alg?: string;
			typ?: string;
		};
		if (header.alg !== "HS256" || header.typ !== "JWT") {
			return null;
		}

		const payload = JSON.parse(
			base64urlDecodeToString(payloadPart),
		) as AdminSessionPayload;
		if (
			!payload.sub ||
			typeof payload.exp !== "number" ||
			typeof payload.iat !== "number"
		) {
			return null;
		}
		if (payload.exp <= Math.floor(Date.now() / 1000)) {
			return null;
		}
		return payload;
	} catch {
		return null;
	}
}

export function createAdminSessionToken(
	userId: string,
	bootstrap: boolean,
): string {
	const now = Math.floor(Date.now() / 1000);
	const payload: AdminSessionPayload = {
		sub: userId,
		bootstrap,
		iat: now,
		exp: now + ADMIN_SESSION_MAX_AGE_SECONDS,
	};

	const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = base64urlEncode(JSON.stringify(payload));
	const signature = createSignature(`${header}.${body}`);
	return `${header}.${body}.${signature}`;
}

export function issueAdminSession(
	response: any,
	userId: string,
	bootstrap: boolean,
): any {
	response.cookies.set(
		ADMIN_AUTH_COOKIE,
		createAdminSessionToken(userId, bootstrap),
		{
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
			path: "/",
		},
	);
	return response;
}

export function clearAdminSession(response: any): any {
	response.cookies.set(ADMIN_AUTH_COOKIE, "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
	return response;
}

export async function getAdminSessionUser(): Promise<AdminSessionUser | null> {
	// In SvelteKit, this needs to be called from a server hook with the cookies
	// For now, return null to allow public pages to work
	// This will be implemented in +server.ts files that have access to cookies
	return null;
}
