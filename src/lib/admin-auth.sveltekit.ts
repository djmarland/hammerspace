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

	try {
		const payload = JSON.parse(base64urlDecodeToString(parts[1]));
		return payload;
	} catch {
		return null;
	}
}

// SvelteKit-compatible version that accepts cookies from request
export async function getAdminSessionUserFromCookie(cookieValue: string | undefined): Promise<AdminSessionUser | null> {
	if (!cookieValue) {
		return null;
	}

	const payload = parsePayload(cookieValue);
	if (!payload) {
		return null;
	}

	const user = await prisma.user.findUnique({
		where: { id: payload.sub },
		select: {
			id: true,
			name: true,
			hasPasskey: true,
			loginTokenHash: true,
		},
	});

	if (!user) {
		return null;
	}

	return {
		userId: user.id,
		name: user.name,
		hasPasskey: user.hasPasskey,
		bootstrap: payload.bootstrap,
		loginTokenHash: user.loginTokenHash,
	};
}

// Legacy Next.js version (kept for reference, won't work in SvelteKit)
export async function getAdminSessionUser(): Promise<AdminSessionUser | null> {
	// This function requires Next.js context, so it will not work in SvelteKit
	// Use getAdminSessionUserFromCookie instead
	throw new Error("getAdminSessionUser is not available in SvelteKit. Use getAdminSessionUserFromCookie with request.cookies.get()");
}
