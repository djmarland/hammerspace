export type PostFieldName =
	| "title"
	| "slug"
	| "content"
	| "status"
	| "scheduledFor"
	| "coverImageUrl"
	| "coverImageAlt";

export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export interface PostFormValues {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	status: PostStatus;
	scheduledFor: string;
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
		status: "DRAFT",
		scheduledFor: "",
		coverImageUrl: "",
		coverImageAlt: "",
		tagIds: [],
	},
};
