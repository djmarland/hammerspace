import { getPublicArchive } from '@/actions/posts';

export async function load({ url }) {
	const page = url.searchParams.get('page') || undefined;
	const archive = await getPublicArchive({ page });
	return { archive };
}
