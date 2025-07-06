import { PostSummary } from "@/models/PostSummary";
import { Post } from "@/models/Post";
import { Results, resultsFromResponse } from "@/models/Results";
import { apiClient } from "@/lib/ApiClient";

type PostNavigation = {
	nextPost: PostSummary | null;
	previousPost: PostSummary | null;
};

export const getPost = async (urlKey: string): Promise<Post> => {
	const result = await apiClient.get<any>(`/posts/${urlKey}`);
	return Post.fromJSON(result);
};

export const getPostNavigation = async (
	urlKey: string,
): Promise<PostNavigation> => {
	const result = await apiClient.get<any>(`/posts/${urlKey}/navigation`);
	return {
		nextPost: result.next ? PostSummary.fromJSON(result.next) : null,
		previousPost: result.previous
			? PostSummary.fromJSON(result.previous)
			: null,
	};
};

export const getLatestPosts = async (
	limit: number,
): Promise<Results<PostSummary>> => {
	const result = await apiClient.get<any>(`/posts?limit=${limit}`);
	return resultsFromResponse(result, PostSummary.fromJSONList);
};

export const getPostsForEditing = async (
	page = 1,
): Promise<Results<PostSummary>> => {
	const result = await apiClient.get<any>(`/cms/posts?page=${page}`);
	return resultsFromResponse(result, PostSummary.fromJSONList);
};

export const getPostForEditing = async (id: string): Promise<Post> => {
	const result = await apiClient.get<any>(`/cms/posts/${id}`);
	return Post.fromJSON(result);
};
