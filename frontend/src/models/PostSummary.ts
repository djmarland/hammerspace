export type PostSummaryResponse = {
	id: string;
	url_key: string;
	title: string;
	published_at: string | null;
};

export type PostSummaryItem = {
	id: string;
	urlKey: string;
	title: string;
	publishedDate: string | null; // ISO 8601
	url: string;
};

export class PostSummary {
	static isPublished(post: PostSummaryItem): boolean {
		return post.publishedDate !== null;
	}

	static fromJSON(json: PostSummaryResponse): PostSummaryItem {
		return {
			id: json.id,
			urlKey: json.url_key,
			title: json.title,
			publishedDate: json.published_at,
			url: `/posts/${json.url_key}`,
		};
	}

	static fromJSONList(jsonList: PostSummaryResponse[]): PostSummaryItem[] {
		return jsonList.map(PostSummary.fromJSON);
	}
}
