import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueAdminSession } from "@/lib/admin-auth";
import { isValidLoginToken } from "@/lib/login-token";
import type { NextRequest } from "next/server";

interface TokenLoginRequest {
	token?: string;
}

export async function POST(request: NextRequest) {
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
