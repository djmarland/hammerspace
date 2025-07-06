import { getPostNavigation } from "@/services/posts";
import Link from "next/link";

export async function PostNavigation({ urlKey }: { urlKey: string }) {
	const navigation = await getPostNavigation(urlKey);
	return (
		<ul>
			{navigation.previousPost && (
				<li>
					<Link href={`/posts/${navigation.previousPost.urlKey}`}>
						Previous: {navigation.previousPost.title}
					</Link>
				</li>
			)}
			{navigation.nextPost && (
				<li>
					<Link href={`/posts/${navigation.nextPost.urlKey}`}>
						Next: {navigation.nextPost.title}
					</Link>
				</li>
			)}
		</ul>
	);
}
