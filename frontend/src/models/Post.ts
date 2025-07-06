import { PostSummary, PostSummaryResponse } from "@/models/PostSummary";

export type PostResponse = PostSummaryResponse & {
	content: string;
};

export class Post extends PostSummary {
	content: string;

	constructor(data: PostResponse) {
		super(data);
		this.content = data.content;
	}

	static fromJSON(json: PostResponse): Post {
		return new Post(json);
	}

	static fromJSONList(jsonList: PostResponse[]): Post[] {
		return jsonList.map(Post.fromJSON);
	}
}
