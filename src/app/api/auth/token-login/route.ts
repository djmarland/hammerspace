import { NextResponse } from "next/server";
import { issueAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { isValidLoginToken } from "@/lib/login-token";

interface TokenLoginRequest {
	token?: string;
	userId?: string;
}

export async function POST(request: Request) {
	try {
		const body: TokenLoginRequest = await request.json();
		const token = body.token?.trim();
		const userId = body.userId?.trim();

		if (!token || !userId) {
			return NextResponse.json(
				{ error: "Token and user ID are required" },
				{ status: 400 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
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
