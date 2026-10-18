import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { getAllPostsForAdmin } from "@/lib/posts";
import AdminPostCard from "@/components/Admin/AdminPostCard";
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
					<div className={styles.cards}>
						{result.posts.map((post) => (
							<AdminPostCard key={post.id} post={post} headingLevel="h2" />
						))}
					</div>

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
