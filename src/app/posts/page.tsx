import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/Blog/PostCard";
import SidePageHeader from "@/components/Blog/SidePageHeader";
import PaginationNav from "@/components/PaginationNav";
import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate";
import { getPublicArchive } from "@/lib/posts";
import styles from "./page.module.css";
import { RssIcon } from "@/components/Icons/RssIcon.tsx";

export const revalidate = 600;

export const metadata: Metadata = {
	title: "Archive | Hammerspace",
};

function buildArchiveHref(page: number) {
	return page > 1 ? `/posts?page=${page}` : "/posts";
}

interface PostsPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
	const params = await searchParams;
	const archive = await getPublicArchive({ page: params.page });

	return (
		<SiteTemplate
			header={
				<SidePageHeader title="Archive">
					<Link href="/feed.xml" className="piko-icon-link">
						<RssIcon />
						RSS feed
					</Link>
				</SidePageHeader>
			}
		>
			<div className={styles.content}>
				<p className={styles.filterMeta}>
					Showing {archive.posts.length} of {archive.totalCount} posts.
				</p>
				<ol className={styles.list}>
					{archive.posts.map((post) => (
						<li key={post.id}>
							<PostCard post={post} />
						</li>
					))}
				</ol>
				<PaginationNav
					page={archive.page}
					totalPages={archive.totalPages}
					buildHref={buildArchiveHref}
				/>
			</div>
		</SiteTemplate>
	);
}
