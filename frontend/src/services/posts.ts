import { PostSummary, PostSummaryItem } from "@/models/PostSummary";
import { Post, PostItem } from "@/models/Post";
import { Results, resultsFromResponse } from "@/models/Results";
import { apiClient } from "@/lib/ApiClient";

type PostNavigation = {
	nextPost?: PostSummaryItem | null;
	previousPost?: PostSummaryItem | null;
};

export const getPost = async (urlKey: string): Promise<PostItem | null> => {
	const result = await apiClient.get<any>(`/posts/${urlKey}`);
	if (!result) {
		return null;
	}
	return Post.fromJSON(result);
};

export const getPostNavigation = async (
	urlKey: string,
): Promise<PostNavigation> => {
	const result = await apiClient.get<any>(`/posts/${urlKey}/navigation`);
	if (!result) {
		return {};
	}
	return {
		nextPost: result.next ? PostSummary.fromJSON(result.next) : null,
		previousPost: result.previous
			? PostSummary.fromJSON(result.previous)
			: null,
	};
};

export const getLatestPosts = async (
	limit: number,
): Promise<Results<PostSummaryItem>> => {
	const result = await apiClient.get<any>(`/posts?limit=${limit}`);
	return resultsFromResponse(result, PostSummary.fromJSONList);
};

export const getPostsForEditing = async (
	page = 1,
): Promise<Results<PostSummaryItem>> => {
	const result = await apiClient.get<any>(`/cms/posts?page=${page}`);
	return resultsFromResponse(result, PostSummary.fromJSONList);
};

export const getPostForEditing = async (
	id: string,
): Promise<PostItem | null> => {
	const result = await apiClient.get<any>(`/cms/posts/${id}`);
	if (!result) {
		return null;
	}
	return Post.fromJSON(result);
};
