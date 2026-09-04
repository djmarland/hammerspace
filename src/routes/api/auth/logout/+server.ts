import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";

export const POST: RequestHandler = async ({ cookies }) => {
	// Clear admin session cookie
	cookies.delete(ADMIN_AUTH_COOKIE, { path: "/" });

	// Redirect to home page
	throw redirect(303, "/");
};
