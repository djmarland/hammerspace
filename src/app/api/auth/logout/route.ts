import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";

export async function POST() {
	// Use a relative Location header rather than an absolute URL built from
	// `request.url` - behind a reverse proxy the app may see a Host that
	// doesn't match the origin the browser is actually on (e.g. an internal
	// bind address), which would send the user to the wrong place.
	const response = new NextResponse(null, {
		status: 303,
		headers: { Location: "/" },
	});
	return clearAdminSession(response);
}
