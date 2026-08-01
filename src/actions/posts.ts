import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

async function requireAdminSession() {
	const session = await getAdminSessionUser();
	if (!session) {
		throw new Error("Unauthorized");
	}
	return session;
}

export async function getAllPostsForAdmin() {
	await requireAdminSession();
	return prisma.post.findMany({
		orderBy: { updatedAt: "desc" },
		select: {
			id: true,
			title: true,
			slug: true,
			published: true,
			updatedAt: true,
			author: {
				select: { name: true },
			},
		},
	});
}

export async function getPostById(postId: string) {
	await requireAdminSession();
	return prisma.post.findUnique({
		where: { id: postId },
		select: {
			id: true,
			title: true,
			slug: true,
			excerpt: true,
			content: true,
			published: true,
		},
	});
}

export async function getPublishedPosts() {
	return prisma.post.findMany({
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
}

interface PublishedPostsPageOptions {
	page: number;
	pageSize: number;
}

export async function getPublishedPostsPage({
	page,
	pageSize,
}: PublishedPostsPageOptions) {
	const skip = (page - 1) * pageSize;
	const [posts, totalCount] = await prisma.$transaction([
		prisma.post.findMany({
			where: { published: true },
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
			select: {
				id: true,
				title: true,
				slug: true,
				excerpt: true,
				content: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: { name: true },
				},
			},
		}),
		prisma.post.count({
			where: { published: true },
		}),
	]);

	return {
		posts,
		totalCount,
		totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
	};
			},
		},
	});
}

export async function getPostBySlug(slug: string) {
	return prisma.post.findFirst({
		where: {
			slug,
			published: true,
		},
		include: {
			author: {
				select: { name: true },
			},
		},
	});
}
