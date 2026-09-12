import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { issueAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
	clearChallenge,
	credentialIdFromBase64url,
	credentialIdFromLegacyBase64urlString,
	getAndValidateChallenge,
} from "@/lib/webauthn";

export async function POST(request: Request) {
	try {
		const body: AuthenticationResponseJSON = await request.json();

		if (!body.rawId || !body.id) {
			return NextResponse.json(
				{ error: "Credential ID is required" },
				{ status: 400 },
			);
		}

		const credentialIdBuffer = credentialIdFromBase64url(body.rawId);
		let credential = await prisma.webAuthnCredential.findFirst({
			where: { credentialId: credentialIdBuffer },
			include: {
				user: {
					select: {
						id: true,
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
						},
					},
				},
			});
		}

		if (!credential) {
			return NextResponse.json(
				{ error: "Credential not found" },
				{ status: 404 },
			);
		}

		const storedChallenge = await getAndValidateChallenge(credential.user.id);
		if (!storedChallenge) {
			return NextResponse.json(
				{ error: "Invalid or expired challenge" },
				{ status: 400 },
			);
		}

		const verification = await verifyAuthenticationResponse({
			response: body,
			expectedChallenge: storedChallenge,
			expectedOrigin: process.env.PUBLIC_APP_URL || "http://localhost:3000",
			expectedRPID: process.env.PUBLIC_RP_ID || "localhost",
			credential: {
				id: Buffer.from(credential.credentialId).toString("base64url"),
				publicKey: credential.credentialPublicKey,
				counter: credential.counter,
				transports: credential.transports.length
					? credential.transports
					: undefined,
			},
		});

		if (!verification.verified) {
			return NextResponse.json(
				{ error: "Verification failed" },
				{ status: 400 },
			);
		}

		// Update counter
		await prisma.webAuthnCredential.update({
			where: { id: credential.id },
			data: { counter: verification.authenticationInfo!.newCounter },
		});

		// Clear challenge
		await clearChallenge(credential.user.id);

		// Issue admin session via cookie
		const response = NextResponse.json({
			verified: true,
			userId: credential.user.id,
		});
		return issueAdminSession(response, credential.user.id, false);
	} catch (error) {
		console.error("Error verifying authentication:", error);
		return NextResponse.json(
			{ error: "Failed to verify authentication" },
			{ status: 500 },
		);
	}
}
