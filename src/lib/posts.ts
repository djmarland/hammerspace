import type { Prisma } from "@/generated/client";
import { getAdminSessionUser } from "@/lib/admin-auth";
import {
	ADMIN_POSTS_PER_PAGE,
	buildDiscoverablePostWhere,
	clampPage,
	countWords,
	estimateReadingTimeMinutes,
	formatPostStatus,
	parsePageNumber,
	PUBLIC_POSTS_PER_PAGE,
	resolveFirstPublicAt,
	SYNDICATION_POSTS_PER_PAGE,
} from "@/lib/blog";
import { prisma } from "@/lib/db";
import { nowDate } from "@/lib/temporal";

interface AdminPostFilters {
	page?: number | string | string[];
	query?: string;
}

interface PublicPostFilters {
	page?: number | string | string[];
	pageSize?: number;
}

export interface PublicPostSummary {
	id: string;
	title: string;
	slug: string;
	content: string;
	status: "DRAFT" | "PUBLISHED";
	statusLabel: string;
	publishedAt: Date | null;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
	wordCount: number;
	readingTimeMinutes: number;
}

export interface PublicPostDetail extends PublicPostSummary {
	createdAt: Date;
	updatedAt: Date;
}

export interface PaginatedPosts<T> {
	posts: T[];
	page: number;
	totalPages: number;
	totalCount: number;
	pageSize: number;
}

export interface AdminPostSummary {
	id: string;
	title: string;
	slug: string;
	status: "DRAFT" | "PUBLISHED";
	statusLabel: string;
	publishedAt: Date | null;
	updatedAt: Date;
}

export interface AdminPostsResult extends PaginatedPosts<AdminPostSummary> {
	filters: {
		query: string;
	};
}

async function requireAdminSession() {
	const session = await getAdminSessionUser();
	if (!session) {
		throw new Error("Unauthorized");
	}
	return session;
}

const publicPostSelect = {
	id: true,
	title: true,
	slug: true,
	content: true,
	publishedAt: true,
	coverImageUrl: true,
	coverImageAlt: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.PostSelect;

type PublicPostRecord = Prisma.PostGetPayload<{
	select: typeof publicPostSelect;
}>;

const adminPostSelect = {
	id: true,
	title: true,
	slug: true,
	publishedAt: true,
	updatedAt: true,
} satisfies Prisma.PostSelect;

type AdminPostRecord = Prisma.PostGetPayload<{
	select: typeof adminPostSelect;
}>;

function orderPostsByRecency(): Prisma.PostOrderByWithRelationInput[] {
	return [{ publishedAt: "desc" }, { createdAt: "desc" }];
}

function getPostStatus(publishedAt: Date | null): "DRAFT" | "PUBLISHED" {
	return publishedAt ? "PUBLISHED" : "DRAFT";
}

function mapPublicPost(record: PublicPostRecord): PublicPostSummary {
	const status = getPostStatus(record.publishedAt);
	return {
		id: record.id,
		title: record.title,
		slug: record.slug,
		content: record.content,
		status,
		statusLabel: formatPostStatus(status),
		publishedAt: resolveFirstPublicAt(record),
		coverImageUrl: record.coverImageUrl,
		coverImageAlt: record.coverImageAlt,
		wordCount: countWords(record.content),
		readingTimeMinutes: estimateReadingTimeMinutes(record.content),
	};
}

function mapAdminPost(record: AdminPostRecord): AdminPostSummary {
	const status = getPostStatus(record.publishedAt);
	return {
		id: record.id,
		title: record.title,
		slug: record.slug,
		status,
		statusLabel: formatPostStatus(status),
		publishedAt: record.publishedAt,
		updatedAt: record.updatedAt,
	};
}

function buildAdminWhere(
	filters: AdminPostsResult["filters"],
): Prisma.PostWhereInput {
	const clauses: Prisma.PostWhereInput[] = [];
	if (filters.query) {
		clauses.push({
			OR: [
				{ title: { contains: filters.query, mode: "insensitive" } },
				{ slug: { contains: filters.query, mode: "insensitive" } },
				{ content: { contains: filters.query, mode: "insensitive" } },
			],
		});
	}
	if (clauses.length === 0) {
		return {};
	}
	return { AND: clauses };
}

async function getPaginatedPublicPosts(
	where: Prisma.PostWhereInput,
	filters: PublicPostFilters = {},
) {
	const pageSize = filters.pageSize || PUBLIC_POSTS_PER_PAGE;
	const requestedPage = parsePageNumber(filters.page);
	const totalCount = await prisma.post.count({ where });
	const { page, totalPages } = clampPage(requestedPage, totalCount, pageSize);
	const posts = await prisma.post.findMany({
		where,
		orderBy: orderPostsByRecency(),
		skip: (page - 1) * pageSize,
		take: pageSize,
		select: publicPostSelect,
	});

	return {
		posts: posts.map(mapPublicPost),
		page,
		totalPages,
		totalCount,
		pageSize,
	} satisfies PaginatedPosts<PublicPostSummary>;
}

export async function getLatestPublicPosts(limit = 5) {
	const now = nowDate();
	const posts = await prisma.post.findMany({
		where: buildDiscoverablePostWhere(now),
		orderBy: orderPostsByRecency(),
		take: limit,
		select: publicPostSelect,
	});
	return posts.map(mapPublicPost);
}

export async function getPublicArchive(filters: PublicPostFilters = {}) {
	return getPaginatedPublicPosts(
		buildDiscoverablePostWhere(nowDate()),
		filters,
	);
}

export async function getPostBySlug(slug: string) {
	const post = await prisma.post.findFirst({
		where: {
			slug,
		},
		select: publicPostSelect,
	});

	if (!post) {
		return null;
	}

	return {
		...mapPublicPost(post),
		createdAt: post.createdAt,
		updatedAt: post.updatedAt,
	} satisfies PublicPostDetail;
}

export async function getPublicSyndicationPosts(
	filters: PublicPostFilters = {},
) {
	return getPaginatedPublicPosts(buildDiscoverablePostWhere(nowDate()), {
		...filters,
		pageSize: SYNDICATION_POSTS_PER_PAGE,
	});
}

export async function getAllPostsForAdmin(filters: AdminPostFilters = {}) {
	await requireAdminSession();

	const normalizedFilters = {
		query: (filters.query || "").trim(),
	};
	const page = parsePageNumber(filters.page);
	const where = buildAdminWhere(normalizedFilters);
	const totalCount = await prisma.post.count({ where });
	const { page: currentPage, totalPages } = clampPage(
		page,
		totalCount,
		ADMIN_POSTS_PER_PAGE,
	);
	const posts = await prisma.post.findMany({
		where,
		orderBy: [{ updatedAt: "desc" }],
		skip: (currentPage - 1) * ADMIN_POSTS_PER_PAGE,
		take: ADMIN_POSTS_PER_PAGE,
		select: adminPostSelect,
	});

	return {
		posts: posts.map(mapAdminPost),
		page: currentPage,
		totalPages,
		totalCount,
		pageSize: ADMIN_POSTS_PER_PAGE,
		filters: normalizedFilters,
	} satisfies AdminPostsResult;
}

export async function getPostById(postId: string) {
	await requireAdminSession();
	return await prisma.post.findUnique({
		where: { id: postId },
		select: {
			id: true,
			title: true,
			slug: true,
			content: true,
			publishedAt: true,
			createdAt: true,
			updatedAt: true,
			coverImageUrl: true,
			coverImageAlt: true,
		},
	});
}
