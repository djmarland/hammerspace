import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE, hasValidAdminSessionToken } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
	if (request.nextUrl.pathname === "/admin/login") {
		return NextResponse.next();
	}

	const sessionToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
	if (!hasValidAdminSessionToken(sessionToken)) {
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}
}

export const config = {
	matcher: ["/admin/:path*"],
};
