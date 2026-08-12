import { getPublicArchive } from '@/lib/posts';

export async function load({ url }) {
	const page = url.searchParams.get('page') || undefined;
	const archive = await getPublicArchive({ page });
	return { archive };
}
