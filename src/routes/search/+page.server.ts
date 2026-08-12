import { searchPublicPosts } from '@/actions/posts';

export async function load({ url }) {
	const q = (url.searchParams.get('q') || '').trim();
	const page = url.searchParams.get('page') || undefined;
	const results = await searchPublicPosts({ query: q, page });

	return { query: q, results };
}
