import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionUser } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
	if (request.nextUrl.pathname === "/admin/login") {
		return NextResponse.next();
	}

	const session = await getAdminSessionUser();
	if (!session) {
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}
}

export const config = {
	matcher: ["/admin/:path*"],
};
