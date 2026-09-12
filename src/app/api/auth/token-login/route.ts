import { NextResponse } from "next/server";
import { issueAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { isValidLoginToken } from "@/lib/login-token";

interface TokenLoginRequest {
	token?: string;
}

export async function POST(request: Request) {
	try {
		const body: TokenLoginRequest = await request.json();
		const token = body.token?.trim();

		if (!token) {
			return NextResponse.json({ error: "Token is required" }, { status: 400 });
		}

		const user = await prisma.user.findFirst({
			where: { isAdmin: true },
			select: {
				id: true,
				loginTokenHash: true,
			},
		});

		if (!user || !isValidLoginToken(token, user.loginTokenHash)) {
			return NextResponse.json(
				{ error: "Invalid login token" },
				{ status: 401 },
			);
		}

		const response = NextResponse.json({
			ok: true,
			redirectTo: "/admin?setupPasskey=1",
		});
		return issueAdminSession(response, user.id, true);
	} catch (error) {
		console.error("Error during token login:", error);
		return NextResponse.json(
			{ error: "Failed to process token login" },
			{ status: 500 },
		);
	}
}
