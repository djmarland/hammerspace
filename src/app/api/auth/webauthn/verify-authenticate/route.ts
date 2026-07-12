import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import {
	clearChallenge,
	credentialIdFromBase64url,
	credentialIdFromLegacyBase64urlString,
	getAndValidateChallenge,
} from "@/lib/webauthn";
import { issueAdminSession } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export async function POST(request: NextRequest) {
	try {
		const body: VerifyAuthenticationRequest = await request.json();

		if (!body.rawId || !body.id) {
			return Response.json(
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
			return Response.json({ error: "Credential not found" }, { status: 404 });
		}

		const storedChallenge = await getAndValidateChallenge(credential.user.id);
		if (!storedChallenge) {
			return Response.json(
				{ error: "Invalid or expired challenge" },
				{ status: 400 },
			);
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
			return Response.json({ error: "Verification failed" }, { status: 400 });
		}

		// Update counter
		await prisma.webAuthnCredential.update({
			where: { id: credential.id },
			data: { counter: verification.authenticationInfo!.newCounter },
		});

		// Clear challenge
		await clearChallenge(credential.user.id);

		const response = NextResponse.json({
			verified: true,
			userId: credential.user.id,
		});
		return issueAdminSession(response, credential.user.id, false);
	} catch (error) {
		console.error("Error verifying authentication:", error);
		return Response.json(
			{ error: "Failed to verify authentication" },
			{ status: 500 },
		);
	}
}
