import { getAdminSessionUser } from "@/lib/admin-auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	// Add session to locals if available
	event.locals.session = await getAdminSessionUser();
	return resolve(event);
};
