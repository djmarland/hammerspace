import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import {
	clearChallenge,
	credentialIdFromBase64url,
	credentialIdFromLegacyBase64urlString,
	getAndValidateChallenge,
} from "@/lib/webauthn";
import {
	createAdminSessionToken,
	ADMIN_AUTH_COOKIE,
	ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-auth";

interface VerifyAuthenticationRequest {
	id: string;
	rawId: string;
	response: {
		clientDataJSON: string;
		authenticatorData: string;
		signature: string;
		userHandle?: string;
	};
	type: string;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body: VerifyAuthenticationRequest = await request.json();

		if (!body.rawId || !body.id) {
			return json({ error: "Credential ID is required" }, { status: 400 });
		}

		const credentialIdBuffer = credentialIdFromBase64url(body.rawId);
		let credential = await prisma.webAuthnCredential.findFirst({
			where: { credentialId: credentialIdBuffer },
			include: {
				user: {
					select: {
						id: true,
						isAdmin: true,
					},
				},
			},
		});

		if (!credential) {
			credential = await prisma.webAuthnCredential.findFirst({
				where: {
					credentialId: credentialIdFromLegacyBase64urlString(body.rawId),
				},
				include: {
					user: {
						select: {
							id: true,
							isAdmin: true,
						},
					},
				},
			});
		}

		if (!credential || !credential.user.isAdmin) {
			return json({ error: "Credential not found" }, { status: 404 });
		}

		const storedChallenge = await getAndValidateChallenge(credential.user.id);
		if (!storedChallenge) {
			return json({ error: "Invalid or expired challenge" }, { status: 400 });
		}

		const verification = await verifyAuthenticationResponse({
			response: body as any,
			expectedChallenge: storedChallenge,
			expectedOrigin:
				process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
			expectedRPID: process.env.NEXT_PUBLIC_RP_ID || "localhost",
			credential: {
				id: Buffer.from(credential.credentialId).toString("base64url"),
				publicKey: credential.credentialPublicKey,
				counter: credential.counter,
				transports: (credential.transports as any) || undefined,
			},
		});

		if (!verification.verified) {
			return json({ error: "Verification failed" }, { status: 400 });
		}

		// Update counter
		await prisma.webAuthnCredential.update({
			where: { id: credential.id },
			data: { counter: verification.authenticationInfo!.newCounter },
		});

		// Clear challenge
		await clearChallenge(credential.user.id);

		// Issue admin session via cookie
		cookies.set(
			ADMIN_AUTH_COOKIE,
			createAdminSessionToken(credential.user.id, false),
			{
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
				path: "/",
			},
		);

		return json({
			verified: true,
			userId: credential.user.id,
		});
	} catch (error) {
		console.error("Error verifying authentication:", error);
		return json({ error: "Failed to verify authentication" }, { status: 500 });
	}
};
