import Link from "next/link";
import { searchPublicPosts } from "@/actions/posts";
import PostCard from "@/components/Blog/PostCard";
import pageStyles from "@/components/Blog/BlogPage.module.css";
import PaginationNav from "@/components/PaginationNav";

export const revalidate = 60;

interface SearchPageProps {
	searchParams: Promise<{ q?: string; page?: string }>;
}

function buildSearchHref(query: string, page: number) {
	const params = new URLSearchParams({ q: query });
	if (page > 1) {
		params.set("page", String(page));
	}
	return `/search?${params.toString()}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const { q = "", page } = await searchParams;
	const query = q.trim();
	const results = await searchPublicPosts({ query, page });

	return (
		<main className={pageStyles.container}>
			<header className={pageStyles.header}>
				<h1>Search posts</h1>
				<p className={pageStyles.intro}>
					Searches title, excerpt, and Markdown content across all public posts.
				</p>
				<form action="/search" className={pageStyles.searchForm}>
					<input
						type="search"
						name="q"
						defaultValue={query}
						placeholder="Search posts"
						className={pageStyles.searchInput}
					/>
					<button type="submit" className={pageStyles.button}>
						Search
					</button>
				</form>
			</header>

			{query ? (
				<>
					<p className={pageStyles.filterMeta}>
						{results.totalCount === 0
							? `No results for “${query}”.`
							: `Found ${results.totalCount} result${results.totalCount === 1 ? "" : "s"} for “${query}”.`}
					</p>
					<div className={pageStyles.list}>
						{results.posts.map((post) => (
							<PostCard key={post.id} post={post} />
						))}
					</div>
					<PaginationNav
						page={results.page}
						totalPages={results.totalPages}
						buildHref={(nextPage) => buildSearchHref(query, nextPage)}
					/>
				</>
			) : (
				<p className={pageStyles.empty}>
					Enter a search term or <Link href="/blog">browse the archive</Link>.
				</p>
			)}
		</main>
	);
}
