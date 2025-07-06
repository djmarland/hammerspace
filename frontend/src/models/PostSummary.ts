import { DisplayDate } from "@/models/DisplayDate";

export type PostSummaryResponse = {
	id: string;
	url_key: string;
	title: string;
	published_at: string | null;
};

export class PostSummary {
	id: string;
	urlKey: string;
	title: string;
	publishedDate: DisplayDate | null;

	constructor(data: PostSummaryResponse) {
		this.id = data.id;
		this.urlKey = data.url_key;
		this.title = data.title;
		this.publishedDate = data.published_at
			? DisplayDate.fromISO(data.published_at)
			: null;
	}

	get isPublished(): boolean {
		return this.publishedDate !== null;
	}

	get url(): string {
		return `/posts/${this.urlKey}`;
	}

	static fromJSON(json: PostSummaryResponse): PostSummary {
		return new PostSummary(json);
	}

	static fromJSONList(jsonList: PostSummaryResponse[]): PostSummary[] {
		return jsonList.map(PostSummary.fromJSON);
	}
}
