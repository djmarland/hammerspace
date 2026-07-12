"use server";

import { prisma } from "@/lib/db";

export async function createPost(data: {
	title: string;
	slug: string;
	content: string;
	excerpt?: string;
	authorId: string;
}) {
	try {
		const post = await prisma.post.create({
			data,
		});
		return { success: true, post };
	} catch (error) {
		return { success: false, error: "Failed to create post" };
	}
}

export async function updatePost(
	id: string,
	data: {
		title?: string;
		slug?: string;
		content?: string;
		excerpt?: string;
		published?: boolean;
	},
) {
	try {
		const post = await prisma.post.update({
			where: { id },
			data,
		});
		return { success: true, post };
	} catch (error) {
		return { success: false, error: "Failed to update post" };
	}
}

export async function deletePost(id: string) {
	try {
		await prisma.post.delete({
			where: { id },
		});
		return { success: true };
	} catch (error) {
		return { success: false, error: "Failed to delete post" };
	}
}

export async function getPublishedPosts() {
	try {
		const posts = await prisma.post.findMany({
			where: { published: true },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				title: true,
				slug: true,
				excerpt: true,
				createdAt: true,
				author: {
					select: { name: true },
				},
			},
		});
		return { success: true, posts };
	} catch (error) {
		return { success: false, error: "Failed to fetch posts" };
	}
}

export async function getPostBySlug(slug: string) {
	try {
		const post = await prisma.post.findUnique({
			where: { slug },
			include: {
				author: {
					select: { name: true },
				},
			},
		});
		return { success: true, post };
	} catch (error) {
		return { success: false, error: "Failed to fetch post" };
	}
}
