import { getLatestPublicPosts } from '@/actions/posts';

export async function load() {
	const posts = await getLatestPublicPosts(6);
	return { posts };
}
