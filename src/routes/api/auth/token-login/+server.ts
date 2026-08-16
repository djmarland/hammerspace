import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { prisma } from "@/lib/db";
import { isValidLoginToken } from "@/lib/login-token";
import {
	createAdminSessionToken,
	ADMIN_AUTH_COOKIE,
	ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-auth";

interface TokenLoginRequest {
	token?: string;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body: TokenLoginRequest = await request.json();
		const token = body.token?.trim();

		if (!token) {
			return json({ error: "Token is required" }, { status: 400 });
		}

		const user = await prisma.user.findFirst({
			where: { isAdmin: true },
			select: {
				id: true,
				loginTokenHash: true,
			},
		});

		if (!user || !isValidLoginToken(token, user.loginTokenHash)) {
			return json({ error: "Invalid login token" }, { status: 401 });
		}

		// Issue admin session by setting cookie
		cookies.set(ADMIN_AUTH_COOKIE, createAdminSessionToken(user.id, true), {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
			path: "/",
		});

		return json({
			ok: true,
			redirectTo: "/admin?setupPasskey=1",
		});
	} catch (error) {
		console.error("Error during token login:", error);
		return json({ error: "Failed to process token login" }, { status: 500 });
	}
};
