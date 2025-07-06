import { getPostsForEditing } from "@/services/posts";
import Link from "next/link";
import { DisplayDate } from "@/models/DisplayDate";
import { PostSummary } from "@/models/PostSummary";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const { page: pageParam } = await searchParams;
	const page = pageParam ? parseInt(pageParam) : 1;
	const results = await getPostsForEditing(page);
	return (
		<div>
			<h1>Posts ({results.total})</h1>
			<Link href="/cms/new" className="button">
				Create New Post
			</Link>
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Published</th>
						<th>Date</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{results.items.map((post) => (
						<tr key={post.id}>
							<td>
								<Link href={`/cms/${post.id}`}>{post.title}</Link>
							</td>
							<td>{PostSummary.isPublished(post) ? "Yes" : "No"}</td>
							<td>{DisplayDate.format(post.publishedDate)}</td>
							<td>
								{PostSummary.isPublished(post) ? (
									<a href={post.url} target="_blank">
										View
									</a>
								) : (
									<Link href={`/cms/${post.id}/publish`}>Publish</Link>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
