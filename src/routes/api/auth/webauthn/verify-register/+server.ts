import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin-auth";
import {
	clearChallenge,
	credentialIdFromBase64url,
	getAndValidateChallenge,
} from "@/lib/webauthn";

interface VerifyRegistrationRequest {
	id: string;
	rawId: string;
	response: {
		clientDataJSON: string;
		attestationObject: string;
		transports?: string[];
	};
	type: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const sessionUser = await getAdminSessionUser();

		if (!sessionUser) {
			return json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: sessionUser.userId },
			include: {
				credentials: true,
			},
		});

		if (!user) {
			return json({ error: "User not found" }, { status: 404 });
		}

		const body: VerifyRegistrationRequest = await request.json();

		// Validate challenge
		const storedChallenge = await getAndValidateChallenge(user.id);
		if (!storedChallenge) {
			return json({ error: "Invalid or expired challenge" }, { status: 400 });
		}

		const verification = await verifyRegistrationResponse({
			response: body as any,
			expectedChallenge: storedChallenge,
			expectedOrigin:
				process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
			expectedRPID: process.env.NEXT_PUBLIC_RP_ID || "localhost",
		});

		if (!verification.verified || !verification.registrationInfo) {
			return json({ error: "Verification failed" }, { status: 400 });
		}

		const { credential } = verification.registrationInfo;

		// Store the credential
		await prisma.webAuthnCredential.create({
			data: {
				userId: user.id,
				credentialId: credentialIdFromBase64url(body.rawId),
				credentialPublicKey: Buffer.from(credential.publicKey),
				counter: credential.counter,
				transports: body.response.transports || [],
			},
		});

		// Clear login token after first passkey registration (bootstrap mode)
		if (sessionUser.bootstrap && user.loginTokenHash) {
			await prisma.user.update({
				where: { id: user.id },
				data: {
					loginTokenHash: null,
				},
			});
		}

		// Clear the challenge
		await clearChallenge(user.id);

		return json({ verified: true });
	} catch (error) {
		console.error("Error verifying registration:", error);
		return json({ error: "Failed to verify registration" }, { status: 500 });
	}
};
