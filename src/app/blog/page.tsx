import Link from "next/link";
import { getPublicArchive } from "@/actions/posts";
import PostCard from "@/components/Blog/PostCard";
import pageStyles from "@/components/Blog/BlogPage.module.css";
import PaginationNav from "@/components/PaginationNav";

export const revalidate = 60;

interface BlogArchivePageProps {
	searchParams: Promise<{ page?: string }>;
}

function buildArchiveHref(page: number) {
	return page > 1 ? `/blog?page=${page}` : "/blog";
}

export default async function BlogArchivePage({ searchParams }: BlogArchivePageProps) {
	const { page } = await searchParams;
	const archive = await getPublicArchive({ page });

	return (
		<main className={pageStyles.container}>
			<header className={pageStyles.header}>
				<h1>Blog archive</h1>
				<p className={pageStyles.intro}>
					Browse every published post and scheduled post whose time has arrived.
				</p>
				<div className={pageStyles.actions}>
					<Link href="/" className={pageStyles.actionLink}>
						Home
					</Link>
					<Link href="/feed.xml" className={pageStyles.actionLink}>
						RSS feed
					</Link>
				</div>
			</header>

			<p className={pageStyles.filterMeta}>
				Showing {archive.posts.length} of {archive.totalCount} posts.
			</p>
			<div className={pageStyles.list}>
				{archive.posts.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
			<PaginationNav
				page={archive.page}
				totalPages={archive.totalPages}
				buildHref={buildArchiveHref}
			/>
		</main>
	);
}
