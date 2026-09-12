import { generateRegistrationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { storeChallenge } from "@/lib/webauthn";

export async function POST() {
	try {
		const sessionUser = await getAdminSessionUser();

		if (!sessionUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: sessionUser.userId },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const registrationOptions = await generateRegistrationOptions({
			rpID: process.env.PUBLIC_RP_ID || "localhost",
			rpName: "Hammerspace",
			userID: Buffer.from(user.id),
			userName: user.id,
			userDisplayName: user.name || "Admin",
			attestationType: "none",
			authenticatorSelection: {
				authenticatorAttachment: "platform",
				residentKey: "preferred",
			},
		});

		await storeChallenge(user.id, registrationOptions.challenge);

		return NextResponse.json(registrationOptions);
	} catch (error) {
		console.error("Error generating registration options:", error);
		return NextResponse.json(
			{ error: "Failed to generate registration options" },
			{ status: 500 },
		);
	}
}
