export type PostFieldName = "title" | "slug" | "content";

export interface PostFormValues {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	published: boolean;
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
		published: false,
	},
};
