import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
	const response = NextResponse.redirect(new URL("/", request.url), {
		status: 303,
	});
	return clearAdminSession(response);
}
