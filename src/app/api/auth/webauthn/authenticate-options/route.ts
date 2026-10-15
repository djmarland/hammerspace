import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { credentialIdToBase64url, storeSignInChallenge } from "@/lib/webauthn";

export async function POST() {
	try {
		// Offer every registered passkey, whichever user it belongs to.
		const credentials = await prisma.webAuthnCredential.findMany({
			select: { credentialId: true },
		});

		if (credentials.length === 0) {
			return NextResponse.json(
				{ error: "No passkeys registered" },
				{ status: 400 },
			);
		}

		const options = await generateAuthenticationOptions({
			rpID: process.env.PUBLIC_RP_ID || "localhost",
			userVerification: "preferred",
			allowCredentials: credentials.map((cred) => ({
				id: credentialIdToBase64url(cred.credentialId),
			})),
		});

		await storeSignInChallenge(options.challenge);

		return NextResponse.json(options);
	} catch (error) {
		console.error("Error generating authentication options:", error);
		return NextResponse.json(
			{ error: "Failed to generate authentication options" },
			{ status: 500 },
		);
	}
}
