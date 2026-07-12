import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { storeChallenge } from "@/lib/webauthn";

export async function POST() {
	try {
		const sessionUser = await getAdminSessionUser();

		if (!sessionUser) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: sessionUser.userId },
		});

		if (!user) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		const registrationOptions = await generateRegistrationOptions({
			rpID: process.env.NEXT_PUBLIC_RP_ID || "localhost",
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

		return Response.json(registrationOptions);
	} catch (error) {
		console.error("Error generating registration options:", error);
		return Response.json(
			{ error: "Failed to generate registration options" },
			{ status: 500 },
		);
	}
}
