import crypto from "crypto";

function getTokenSecret(): string {
	const secret =
		process.env.LOGIN_TOKEN_SECRET ??
		process.env.AUTH_JWT_SECRET ??
		process.env.AUTH_SECRET;
	if (!secret) {
		throw new Error(
			"Missing LOGIN_TOKEN_SECRET (or AUTH_JWT_SECRET/AUTH_SECRET)",
		);
	}
	return secret;
}

export function hashLoginToken(rawToken: string): string {
	return crypto
		.createHmac("sha256", getTokenSecret())
		.update(rawToken)
		.digest("hex");
}

export function createRawLoginToken(): string {
	return crypto.randomBytes(32).toString("base64url");
}

export function isValidLoginToken(
	rawToken: string,
	storedHash: string | null,
): boolean {
	if (!storedHash || !rawToken) {
		return false;
	}

	const computed = hashLoginToken(rawToken);
	if (computed.length !== storedHash.length) {
		return false;
	}

	return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
}
