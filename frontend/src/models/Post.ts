import {
	PostSummary,
	PostSummaryItem,
	PostSummaryResponse,
} from "@/models/PostSummary";

export type PostResponse = PostSummaryResponse & {
	content: string;
};

export type PostItem = PostSummaryItem & {
	content: string;
};

export class Post {
	static fromJSON(json: PostResponse): PostItem {
		return {
			...PostSummary.fromJSON(json),
			content: json.content,
		};
	}

	static fromJSONList(jsonList: PostResponse[]): PostItem[] {
		return jsonList.map(Post.fromJSON);
	}
}
