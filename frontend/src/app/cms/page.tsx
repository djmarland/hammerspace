import { getPostsForEditing } from "@/services/posts";
import Link from "next/link";

export default async function Page({
	searchParams,
}: {
	searchParams: { page?: string };
}) {
	const page = searchParams.page ? parseInt(searchParams.page) : 1;
	const results = await getPostsForEditing(page);
	return (
		<div>
			<h1>Posts ({results.total})</h1>
			<a href="/cms/new" className="button">
				Create New Post
			</a>
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>Published</th>
						<th>Date</th>
						<th>View</th>
					</tr>
				</thead>
				<tbody>
					{results.items.map((post) => (
						<tr key={post.id}>
							<td>
								<Link href={`/cms/${post.id}`}>{post.title}</Link>
							</td>
							<td>{post.isPublished ? "Yes" : "No"}</td>
							<td>{post.publishedDate?.toString() ?? "-"}</td>
							<td>
								<a href={post.url} target="_blank">
									View
								</a>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
