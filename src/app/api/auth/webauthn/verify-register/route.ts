import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
	clearChallenge,
	credentialIdFromBase64url,
	getAndValidateChallenge,
} from "@/lib/webauthn";

export async function POST(request: Request) {
	try {
		const sessionUser = await getAdminSessionUser();

		if (!sessionUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: sessionUser.userId },
			include: {
				credentials: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const body: RegistrationResponseJSON = await request.json();

		// Validate challenge
		const storedChallenge = await getAndValidateChallenge(user.id);
		if (!storedChallenge) {
			return NextResponse.json(
				{ error: "Invalid or expired challenge" },
				{ status: 400 },
			);
		}

		const verification = await verifyRegistrationResponse({
			response: body,
			expectedChallenge: storedChallenge,
			expectedOrigin: process.env.PUBLIC_APP_URL || "http://localhost:3000",
			expectedRPID: process.env.PUBLIC_RP_ID || "localhost",
		});

		if (!verification.verified || !verification.registrationInfo) {
			return NextResponse.json(
				{ error: "Verification failed" },
				{ status: 400 },
			);
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

		return NextResponse.json({ verified: true });
	} catch (error) {
		console.error("Error verifying registration:", error);
		return NextResponse.json(
			{ error: "Failed to verify registration" },
			{ status: 500 },
		);
	}
}
