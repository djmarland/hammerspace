import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicTagArchive } from "@/actions/posts";
import PostCard from "@/components/Blog/PostCard";
import pageStyles from "@/components/Blog/BlogPage.module.css";
import PaginationNav from "@/components/PaginationNav";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 60;

interface TagArchivePageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ page?: string }>;
}

function buildTagHref(slug: string, page: number) {
	return page > 1 ? `/tags/${slug}?page=${page}` : `/tags/${slug}`;
}

export default async function TagArchivePage({ params, searchParams }: TagArchivePageProps) {
	const [{ slug }, { page }] = await Promise.all([params, searchParams]);
	const archive = await getPublicTagArchive({ slug, page });
	if (!archive) {
		notFound();
	}

	return (
		<main className={pageStyles.container}>
			<header className={pageStyles.header}>
				<div className={pageStyles.tagTitle}>
					<h1>#{archive.tag.name}</h1>
					<Link href="/blog" className={pageStyles.actionLink}>
						Back to archive
					</Link>
				</div>
				<p className={pageStyles.intro}>
					{archive.posts.totalCount === 0
						? "No public posts currently use this tag."
						: `${archive.posts.totalCount} post${archive.posts.totalCount === 1 ? "" : "s"} currently visible under this tag.`}
				</p>
			</header>
			<div className={pageStyles.list}>
				{archive.posts.posts.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
			<PaginationNav
				page={archive.posts.page}
				totalPages={archive.posts.totalPages}
				buildHref={(nextPage) => buildTagHref(archive.tag.slug, nextPage)}
			/>
		</main>
	);
}

export async function generateMetadata({ params }: TagArchivePageProps): Promise<Metadata> {
	const { slug } = await params;
	const archive = await getPublicTagArchive({ slug, page: 1 });
	if (!archive) {
		return {};
	}

	return {
		title: `#${archive.tag.name}`,
		description: `Posts tagged ${archive.tag.name}`,
		alternates: { canonical: absoluteUrl(`/tags/${archive.tag.slug}`) },
	};
}
