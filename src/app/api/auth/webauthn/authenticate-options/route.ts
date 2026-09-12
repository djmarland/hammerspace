import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { credentialIdToBase64url, storeChallenge } from "@/lib/webauthn";

export async function POST() {
	try {
		const user = await prisma.user.findFirst({
			include: {
				credentials: {
					select: {
						credentialId: true,
						transports: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json({ error: "No user found" }, { status: 400 });
		}

		// Allow authentication even with no credentials (first-time setup)
		const allowCredentials = user.credentials.map((cred) => ({
			id: credentialIdToBase64url(cred.credentialId),
		}));

		const options = await generateAuthenticationOptions({
			rpID: process.env.PUBLIC_RP_ID || "localhost",
			userVerification: "preferred",
			allowCredentials:
				allowCredentials.length > 0 ? allowCredentials : undefined,
		});

		await storeChallenge(user.id, options.challenge);

		return NextResponse.json(options);
	} catch (error) {
		console.error("Error generating authentication options:", error);
		return NextResponse.json(
			{ error: "Failed to generate authentication options" },
			{ status: 500 },
		);
	}
}
