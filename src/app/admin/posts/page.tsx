import Link from "next/link";
import {
	archivePostAction,
	deletePostAction,
	unpublishPostAction,
} from "@/actions/post-form-actions";
import { getAllPostsForAdmin } from "@/actions/posts";
import ConfirmSubmitButton from "@/components/Admin/ConfirmSubmitButton";
import PaginationNav from "@/components/PaginationNav";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { formatDateTimeLocalValue } from "@/lib/temporal";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

interface AdminPostsPageProps {
	searchParams: Promise<{ page?: string; query?: string; status?: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

function buildAdminPostsHref(query: string, status: string, page: number) {
	const params = new URLSearchParams();
	if (query) {
		params.set("query", query);
	}
	if (status && status !== "ALL") {
		params.set("status", status);
	}
	if (page > 1) {
		params.set("page", String(page));
	}
	const qs = params.toString();
	return qs ? `/admin/posts?${qs}` : "/admin/posts";
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const { page, query, status } = await searchParams;
	const posts = await getAllPostsForAdmin({ page, query, status: status as never });
	const returnTo = buildAdminPostsHref(posts.filters.query, posts.filters.status, posts.page);

	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<div>
					<h1>Manage Posts</h1>
					<p className={styles.meta}>
						{posts.totalCount} matching post{posts.totalCount === 1 ? "" : "s"}
					</p>
				</div>
				<div className={styles.headerActions}>
					<Link href="/admin/tags" className={styles.secondaryButton}>
						Manage tags
					</Link>
					<Link href="/admin/posts/new" className={styles.button}>
						New Post
					</Link>
				</div>
			</header>

			<form className={styles.filters}>
				<label className={styles.searchField}>
					<span className={styles.visuallyHidden}>Search posts</span>
					<input
						type="search"
						name="query"
						defaultValue={posts.filters.query}
						placeholder="Search title, excerpt, content, or slug"
					/>
				</label>
				<label>
					<span className={styles.visuallyHidden}>Filter by status</span>
					<select name="status" defaultValue={posts.filters.status} className={styles.selectField}>
						<option value="ALL">All statuses</option>
						<option value="DRAFT">Draft</option>
						<option value="SCHEDULED">Scheduled</option>
						<option value="PUBLISHED">Published</option>
						<option value="ARCHIVED">Archived</option>
					</select>
				</label>
				<button type="submit" className={styles.button}>
					Apply
				</button>
			</form>

			{posts.posts.length === 0 ? (
				<p className={styles.empty}>No posts match the current filters.</p>
			) : (
				<>
					<ul className={styles.list}>
						{posts.posts.map((post) => (
							<li key={post.id} className={styles.item}>
								<div className={styles.itemHeader}>
									<div>
										<h2>{post.title}</h2>
										<p className={styles.meta}>
											/{post.slug} · {post.statusLabel} · By {post.authorName}
										</p>
										<div className={styles.metaList}>
											{post.publishedAt && (
												<span>First public: {dateFormatter.format(post.publishedAt)}</span>
											)}
											{post.scheduledFor && (
												<span>
													Scheduled: <time dateTime={post.scheduledFor.toISOString()}>{formatDateTimeLocalValue(post.scheduledFor)} UTC</time>
												</span>
											)}
											<span>Updated: {dateFormatter.format(post.updatedAt)}</span>
										</div>
										{post.tags.length > 0 && (
											<ul className={styles.tagList}>
												{post.tags.map((tag) => (
													<li key={tag.slug}>#{tag.name}</li>
												))}
											</ul>
										)}
									</div>
									<div className={styles.linkGroup}>
										<Link href={`/blog/${post.slug}`} className={styles.link}>
											View public page
										</Link>
										<Link href={`/admin/posts/${post.id}/edit`} className={styles.link}>
											Edit
										</Link>
									</div>
								</div>

								<div className={styles.buttonRow}>
									{post.status !== "DRAFT" && (
										<form action={unpublishPostAction} className={styles.inlineForm}>
											<input type="hidden" name="postId" value={post.id} />
											<input type="hidden" name="returnTo" value={returnTo} />
											<ConfirmSubmitButton
												className={styles.secondaryButton}
												label="Move to draft"
												confirmMessage="Move this post to draft? Draft posts stay publicly visible on their real blog URL."
											/>
										</form>
									)}
									{post.status !== "ARCHIVED" && (
										<form action={archivePostAction} className={styles.inlineForm}>
											<input type="hidden" name="postId" value={post.id} />
											<input type="hidden" name="returnTo" value={returnTo} />
											<ConfirmSubmitButton
												className={styles.secondaryButton}
												label="Archive"
												confirmMessage="Archive this post? Archived posts are removed from public pages, feeds, and sitemap entries."
											/>
										</form>
									)}
									<form action={deletePostAction} className={styles.inlineForm}>
										<input type="hidden" name="postId" value={post.id} />
										<input type="hidden" name="returnTo" value={returnTo} />
										<ConfirmSubmitButton
											className={styles.dangerButton}
											label="Delete"
											confirmMessage="Delete this post permanently? This cannot be undone."
										/>
									</form>
								</div>
							</li>
						))}
					</ul>
					<PaginationNav
						page={posts.page}
						totalPages={posts.totalPages}
						buildHref={(nextPage) =>
							buildAdminPostsHref(posts.filters.query, posts.filters.status, nextPage)
						}
					/>
				</>
			)}
		</main>
	);
}
