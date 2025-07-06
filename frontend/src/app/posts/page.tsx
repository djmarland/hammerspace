import Link from "next/link";
import { getLatestPosts } from "@/services/posts";

export const revalidate = 3600;

export default async function Page() {
	const results = await getLatestPosts(20);

	return (
		<ul>
			{results.items.map((post) => (
				<li key={post.id}>
					<Link href={post.url}>{post.title}</Link>
				</li>
			))}
		</ul>
	);
}
