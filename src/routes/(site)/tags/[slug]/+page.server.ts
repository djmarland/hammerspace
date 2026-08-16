import { getPublicTagArchive } from "@/lib/posts";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url }) => {
	const page = url.searchParams.get("page") || undefined;
	const archive = await getPublicTagArchive({ slug: params.slug, page });
	if (!archive) {
		error(404, "Tag not found");
	}

	return { archive };
};
