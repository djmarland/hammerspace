import { getPost } from "@/services/posts";
import { PostNavigation } from "@/components/organisms/PostNavigation/PostNavigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import styles from "./page.module.css";
import { DisplayDate } from "@/models/DisplayDate";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export default async function Page({
	params,
}: {
	params: Promise<{ key: string }>;
}) {
	const { key } = await params;
	const post = await getPost(key);
	if (!post) {
		notFound();
	}

	return (
		<article className={styles.post}>
			<h1 className={styles.title}>{post.title}</h1>
			{post.publishedDate && (
				<div className={styles.publishedDate}>
					Published on {DisplayDate.format(post.publishedDate)}
				</div>
			)}
			<div className={styles.content}>
				<ReactMarkdown rehypePlugins={[rehypeRaw]}>
					{post.content}
				</ReactMarkdown>
			</div>
			<PostNavigation urlKey={key} />
		</article>
	);
}
