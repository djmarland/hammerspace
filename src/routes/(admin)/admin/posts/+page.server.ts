import {redirect} from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";
import {getAllPostsForAdmin} from "@/lib/posts";

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.session) {
		throw redirect(302, "/admin/login");
	}

	const query = url.searchParams.get("query") || "";
	const page = url.searchParams.get("page") || "1";

	const result = await getAllPostsForAdmin({
		query,
		page,
	});

	return result;
};

