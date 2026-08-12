import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin-auth";
import {
	clearChallenge,
	credentialIdFromBase64url,
	getAndValidateChallenge,
} from "@/lib/webauthn";
import type { NextRequest } from "next/server";

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

export async function POST(request: NextRequest) {
	try {
		const sessionUser = await getAdminSessionUser();

		if (!sessionUser) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: sessionUser.userId },
			include: {
				credentials: true,
			},
		});

		if (!user) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		const body: VerifyRegistrationRequest = await request.json();

		// Validate challenge
		const storedChallenge = await getAndValidateChallenge(user.id);
		if (!storedChallenge) {
			return Response.json(
				{ error: "Invalid or expired challenge" },
				{ status: 400 },
			);
		}

		const verification = await verifyRegistrationResponse({
			response: body as any,
			expectedChallenge: storedChallenge,
			expectedOrigin:
				process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
			expectedRPID: process.env.NEXT_PUBLIC_RP_ID || "localhost",
		});

		if (!verification.verified || !verification.registrationInfo) {
			return Response.json({ error: "Verification failed" }, { status: 400 });
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

		return Response.json({ verified: true });
	} catch (error) {
		console.error("Error verifying registration:", error);
		return Response.json(
			{ error: "Failed to verify registration" },
			{ status: 500 },
		);
	}
}
