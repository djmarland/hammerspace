import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { getPostById, getTagsForAdmin } from "@/lib/posts";
import PostEditorForm from "@/components/Admin/PostEditorForm";
import DangerZone from "./DangerZone";
import {
	deletePostAndRedirect,
	unpublishPostAndStay,
	updatePostFormAction,
} from "./actions";
import styles from "./page.module.css";

interface EditPostPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: EditPostPageProps): Promise<Metadata> {
	const { id } = await params;
	const post = await getPostById(id);
	return { title: post ? `Edit Post: ${post.title}` : "Edit Post" };
}

function formatDateTime(date: Date) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default async function EditPostPage({ params }: EditPostPageProps) {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const { id } = await params;
	const [post, tags] = await Promise.all([getPostById(id), getTagsForAdmin()]);

	if (!post) {
		redirect("/admin/posts");
	}

	return (
		<div className="piko-vstack">
			<header className={styles.header}>
				<h1 className="piko-t-h1">{post.title}</h1>
				<dl>
					<dt>Created:</dt>
					<dd>
						<time>{formatDateTime(post.createdAt)}</time>
					</dd>
					<dt>Updated:</dt>
					<dd>
						<time>{formatDateTime(post.updatedAt)}</time>
					</dd>
					{post.publishedAt && (
						<>
							<dt>Published:</dt>
							<dd>
								<time>{formatDateTime(post.publishedAt)}</time>
							</dd>
						</>
					)}
				</dl>
				<div className="piko-hstack">
					<Link href={`/admin/posts/${post.id}/publish`}>
						{post.publishedAt ? "Reschedule publication" : "Publish"}
					</Link>
				</div>
			</header>

			<PostEditorForm
				formAction={updatePostFormAction.bind(null, post.id)}
				submitLabel="Update Post"
				tags={tags}
				mode="edit"
				initialValues={{
					title: post.title,
					slug: post.slug,
					excerpt: post.excerpt || "",
					content: post.content,
					coverImageUrl: post.coverImageUrl || "",
					coverImageAlt: post.coverImageAlt || "",
					tagIds: post.tags.map((tag) => tag.tagId),
				}}
			/>

			<DangerZone
				isPublished={Boolean(post.publishedAt)}
				unpublishAction={unpublishPostAndStay.bind(null, post.id)}
				deleteAction={deletePostAndRedirect.bind(null, post.id)}
			/>
		</div>
	);
}
