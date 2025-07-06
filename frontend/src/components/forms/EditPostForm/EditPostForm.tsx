"use client";

import styles from "../../../app/cms/new/page.module.css";
import editorStyles from "./EditPostForm.module.css";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { FC, useState } from "react";
import { PostItem } from "@/models/Post";

export const EditPostFields: FC<{ post?: PostItem }> = ({ post }) => {
	const [markdownContent, setMarkdownContent] = useState(post?.content ?? "");

	return (
		<>
			<div className={styles.formGroup}>
				<label htmlFor="title">Title:</label>
				<input
					type="text"
					id="title"
					name="title"
					defaultValue={post?.title ?? ""}
					required
				/>
			</div>
			<div className={styles.formGroup}>
				<label htmlFor="content">Content:</label>
				<div className={editorStyles.editorContainer}>
					<div>
						<textarea
							id="content"
							name="content"
							className={editorStyles.editor}
							value={markdownContent}
							onChange={(e) => setMarkdownContent(e.target.value)}
							required
						/>
					</div>
					<div className={editorStyles.preview}>
						<ReactMarkdown rehypePlugins={[rehypeRaw]}>
							{markdownContent}
						</ReactMarkdown>
					</div>
				</div>
			</div>
		</>
	);
};
