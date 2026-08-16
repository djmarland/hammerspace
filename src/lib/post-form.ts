export type PostFieldName =
	| "title"
	| "slug"
	| "content"
	| "publishedAt"
	| "coverImageUrl"
	| "coverImageAlt";

export interface PostFormValues {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	isPublished: boolean;
	publishedAt: string;
	coverImageUrl: string;
	coverImageAlt: string;
	tagIds: string[];
}

export interface PostFormState {
	formError: string | null;
	fieldErrors: Partial<Record<PostFieldName, string>>;
	values: PostFormValues;
}

export const initialPostFormState: PostFormState = {
	formError: null,
	fieldErrors: {},
	values: {
		title: "",
		slug: "",
		excerpt: "",
		content: "",
		isPublished: false,
		publishedAt: "",
		coverImageUrl: "",
		coverImageAlt: "",
		tagIds: [],
	},
};
