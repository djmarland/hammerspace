import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { getPostById } from "@/lib/posts";
import { formatDateTimeLocalValue } from "@/lib/temporal";
import PublishForm from "./PublishForm";
import { publishPostFormAction } from "./actions";

interface PublishPostPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: PublishPostPageProps): Promise<Metadata> {
	const { id } = await params;
	const post = await getPostById(id);
	return { title: post ? `Publish: ${post.title}` : "Publish Post" };
}

export default async function PublishPostPage({
	params,
}: PublishPostPageProps) {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const { id } = await params;
	const post = await getPostById(id);
	if (!post) {
		redirect("/admin/posts");
	}

	const initialPublishedAt = post.publishedAt
		? formatDateTimeLocalValue(new Date(post.publishedAt))
		: formatDateTimeLocalValue(new Date());

	return (
		<div className="piko-page-container piko-vstack">
			<h1 className="piko-t-h1">Publish &quot;{post.title}&quot;</h1>

			<p>
				{post.publishedAt
					? "This post is already published. Choose a new date/time below to reschedule it."
					: 'Choose the date and time this post should go live. The slug will be updated with a "-mm-yyyy" suffix based on this date once you publish.'}
			</p>

			<PublishForm
				formAction={publishPostFormAction.bind(null, post.id)}
				postId={post.id}
				initialSlug={post.slug}
				initialPublishedAt={initialPublishedAt}
				isFirstPublish={!post.publishedAt}
			/>
		</div>
	);
}
