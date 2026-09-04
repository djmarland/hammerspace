import { getLatestPublicPosts } from "@/lib/posts";

export async function load() {
	const posts = await getLatestPublicPosts(5);
	return { posts };
}
