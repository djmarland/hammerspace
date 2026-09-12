import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import PostCard from "@/components/Blog/PostCard";
import PaginationNav from "@/components/PaginationNav";
import { getPublicTagArchive } from "@/lib/posts";
import styles from "./page.module.css";

interface TagPageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

function buildTagHref(slug: string, page: number) {
	return page > 1 ? `/tags/${slug}?page=${page}` : `/tags/${slug}`;
}

// generateMetadata and the page component both need the tag archive; React's
// per-request cache() dedupes the underlying DB calls between them without
// needing to touch src/lib/posts.ts.
const getCachedPublicTagArchive = cache(getPublicTagArchive);

export async function generateMetadata({
	params,
	searchParams,
}: TagPageProps): Promise<Metadata> {
	const { slug } = await params;
	const { page } = await searchParams;
	const archive = await getCachedPublicTagArchive({ slug, page });

	if (!archive) {
		return { title: "Tag not found | Hammerspace" };
	}

	return {
		title: `#${archive.tag.name} | Hammerspace`,
		description: `Posts tagged ${archive.tag.name}`,
		alternates: {
			canonical: `https://www.hammerspace.co.uk/tags/${archive.tag.slug}`,
		},
	};
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
	const { slug } = await params;
	const { page } = await searchParams;
	const archive = await getCachedPublicTagArchive({ slug, page });

	if (!archive) {
		notFound();
	}

	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<div className={styles.tagTitle}>
					<h1>#{archive.tag.name}</h1>
					<Link href="/posts" className={styles.actionLink}>
						Back to archive
					</Link>
				</div>
				<p className={styles.intro}>
					{archive.posts.totalCount === 0
						? "No public posts currently use this tag."
						: `${archive.posts.totalCount} post${
								archive.posts.totalCount === 1 ? "" : "s"
							} currently visible under this tag.`}
				</p>
			</header>
			<div className={styles.list}>
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
