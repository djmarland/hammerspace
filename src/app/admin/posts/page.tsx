import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { getAllPostsForAdmin } from "@/lib/posts";
import { isPostPublic } from "@/lib/blog";
import PaginationNav from "@/components/PaginationNav";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Manage Posts",
};

interface AdminPostsPageProps {
	searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function AdminPostsPage({
	searchParams,
}: AdminPostsPageProps) {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const { query = "", page = "1" } = await searchParams;
	const result = await getAllPostsForAdmin({ query, page });

	function buildHref(targetPage: number) {
		const params = new URLSearchParams();
		if (result.filters.query) {
			params.set("query", result.filters.query);
		}
		params.set("page", String(targetPage));
		return `/admin/posts?${params.toString()}`;
	}

	return (
		<div className="piko-page-container piko-vstack">
			<h1 className="piko-t-h1">Manage Posts</h1>

			<form method="GET" className="piko-hstack">
				<label className="piko-hidden" htmlFor="query">
					Search
				</label>
				<input
					id="query"
					type="text"
					name="query"
					placeholder="Search posts..."
					defaultValue={result.filters.query}
				/>
				<button type="submit">Search</button>
			</form>

			<hr />

			<p>
				Showing {result.posts.length} of {result.totalCount} posts
				{result.filters.query ? ` matching "${result.filters.query}"` : ""}
			</p>

			{result.posts.length === 0 ? (
				<p>
					No posts found.{" "}
					{result.filters.query ? "Try adjusting your search." : ""}
				</p>
			) : (
				<>
					<table>
						<thead>
							<tr>
								<th>Title</th>
								<th>Slug</th>
								<th>Status</th>
								<th>Publication Datetime</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{result.posts.map((post) => {
								const state = post.publishedAt
									? isPostPublic(post.publishedAt)
										? "success"
										: "warning"
									: "error";
								const statusLabel = post.publishedAt
									? isPostPublic(post.publishedAt)
										? "Published"
										: "Scheduled"
									: "Draft";

								return (
									<tr
										key={post.id}
										className={styles.statusRow}
										data-state={state}
									>
										<td>
											<Link href={`/admin/posts/${post.id}/edit`}>
												{post.title}
											</Link>
										</td>
										<td className={styles.slugCell}>{post.slug}</td>
										<td>{statusLabel}</td>
										<td>
											{post.publishedAt
												? new Date(post.publishedAt).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
															hour: "2-digit",
															minute: "2-digit",
															hour12: false,
														},
													)
												: "-"}
										</td>
										<td>
											<Link href={`/posts/${post.slug}`}>
												{post.publishedAt ? "View" : "Preview"}
											</Link>
											{!post.publishedAt && (
												<>
													{" "}
													<Link href={`/admin/posts/${post.id}/publish`}>
														Publish
													</Link>
												</>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					<PaginationNav
						page={result.page}
						totalPages={result.totalPages}
						buildHref={buildHref}
					/>
				</>
			)}
		</div>
	);
}
