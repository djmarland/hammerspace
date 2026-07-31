import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
	archivePostAction,
	deletePostAction,
	unpublishPostAction,
	updatePostAction,
} from "@/actions/post-form-actions";
import { getPostById, getTagsForAdmin } from "@/actions/posts";
import ConfirmSubmitButton from "@/components/Admin/ConfirmSubmitButton";
import PostEditorForm from "@/components/Admin/PostEditorForm";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { formatDateTimeLocalValue } from "@/lib/temporal";
import styles from "./page.module.css";

interface EditPostPageProps {
	params: Promise<{ id: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function EditPostPage({ params }: EditPostPageProps) {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const { id } = await params;
	const [post, tags] = await Promise.all([getPostById(id), getTagsForAdmin()]);
	if (!post) {
		notFound();
	}

	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<div>
					<h1>Edit Post</h1>
					<p className={styles.meta}>
						Created {dateFormatter.format(post.createdAt)} · Updated {dateFormatter.format(post.updatedAt)}
					</p>
					{post.publishedAt && (
						<p className={styles.meta}>First public at {dateFormatter.format(post.publishedAt)}</p>
					)}
				</div>
				<Link href="/admin/posts" className={styles.backLink}>
					Back to posts
				</Link>
			</header>

			<PostEditorForm
				action={updatePostAction.bind(null, id)}
				submitLabel="Save changes"
				initialValues={{
					title: post.title,
					slug: post.slug,
					excerpt: post.excerpt ?? "",
					content: post.content,
					status: post.status,
					scheduledFor: formatDateTimeLocalValue(post.scheduledFor),
					coverImageUrl: post.coverImageUrl ?? "",
					coverImageAlt: post.coverImageAlt ?? "",
					tagIds: post.tags.map(({ tagId }) => tagId),
				}}
				tags={tags}
			/>

			<section className={styles.dangerZone}>
				<h2>Visibility and destructive actions</h2>
				<p className={styles.meta}>
					Move to draft keeps the post public. Archive hides it. Delete removes it permanently.
				</p>
				<div className={styles.dangerActions}>
					{post.status !== "DRAFT" && (
						<form action={unpublishPostAction}>
							<input type="hidden" name="postId" value={post.id} />
							<input type="hidden" name="returnTo" value="/admin/posts" />
							<ConfirmSubmitButton
								className={styles.secondaryButton}
								label="Move to draft"
								confirmMessage="Move this post to draft? Draft posts stay publicly visible on their real blog URL."
							/>
						</form>
					)}
					{post.status !== "ARCHIVED" && (
						<form action={archivePostAction}>
							<input type="hidden" name="postId" value={post.id} />
							<input type="hidden" name="returnTo" value="/admin/posts" />
							<ConfirmSubmitButton
								className={styles.secondaryButton}
								label="Archive"
								confirmMessage="Archive this post? Archived posts are removed from public pages, feeds, and sitemap entries."
							/>
						</form>
					)}
					<form action={deletePostAction}>
						<input type="hidden" name="postId" value={post.id} />
						<input type="hidden" name="returnTo" value="/admin/posts" />
						<ConfirmSubmitButton
							className={styles.dangerButton}
							label="Delete permanently"
							confirmMessage="Delete this post permanently? This cannot be undone."
						/>
					</form>
				</div>
			</section>
		</main>
	);
}
