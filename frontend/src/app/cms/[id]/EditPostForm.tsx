"use client";

import styles from "../new/page.module.css";
import editorStyles from "./EditPostForm.module.css";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useState } from "react";

interface EditPostFieldsProps {
	id: string;
	title: string;
	content: string;
}

export function EditPostFields({ id, title, content }: EditPostFieldsProps) {
	const [markdownContent, setMarkdownContent] = useState(content);

	return (
		<>
			<input type="hidden" name="id" value={id} />
			<div className={styles.formGroup}>
				<label htmlFor="title">Title:</label>
				<input
					type="text"
					id="title"
					name="title"
					defaultValue={title}
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
}
