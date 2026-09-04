import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPostBySlug(params.slug);
	if (!post) {
		error(404, "Post not found");
	}
	const relatedPosts = await getRelatedPosts(post.id, post.tags);

	return { post, relatedPosts };
};
