import { redirect } from "@sveltejs/kit";
import { getAdminSessionUser } from "@/lib/admin-auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const session = await getAdminSessionUser();

	if (!session) {
		throw redirect(302, "/admin/login");
	}

	return {
		session,
		setupPasskey: url.searchParams.get("setupPasskey") === "1",
	};
};
