"use client";

import { PostItem } from "@/models/Post";
import { useState } from "react";

export function PublishPostForm({ post }: { post: PostItem }) {
	const [publishDate, setPublishDate] = useState(post.publishedDate || "");
	const [urlKey, setUrlKey] = useState(post.urlKey || "");

	const formatUrlKey = (value: string) => {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9-]/g, "-")
			.replace(/-+/g, "-");
	};

	const setToNow = () => {
		const now = new Date();
		const utcDateTime = now.toISOString().slice(0, 16);
		setPublishDate(utcDateTime);
	};

	return (
		<div>
			<div>
				<label htmlFor="urlKey">URL Key:</label>
				<input
					type="text"
					id="urlKey"
					name="urlKey"
					value={urlKey}
					onChange={(e) => setUrlKey(formatUrlKey(e.target.value))}
					required
				/>
			</div>
			<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
				<div>
					<label htmlFor="publishDate">Publication Date (UTC)</label>
					<input
						type="datetime-local"
						name="publishDate"
						id="publishDate"
						required
						value={publishDate}
						onChange={(e) => setPublishDate(e.target.value)}
					/>
				</div>
				<button type="button" onClick={setToNow}>
					Set to Now
				</button>
			</div>
			<button type="submit">Publish Post</button>
		</div>
	);
}
