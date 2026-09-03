import type {Prisma} from "@/generated/client";
import {getAdminSessionUser} from "@/lib/admin-auth";
import {
    ADMIN_POSTS_PER_PAGE,
    buildDiscoverablePostWhere,
    buildExcerpt,
    clampPage,
    countWords,
    estimateReadingTimeMinutes,
    formatPostStatus,
    parsePageNumber,
    PUBLIC_POSTS_PER_PAGE,
    resolveFirstPublicAt,
    SYNDICATION_POSTS_PER_PAGE,
} from "@/lib/blog";
import {prisma} from "@/lib/db";
import {nowDate} from "@/lib/temporal";

interface AdminPostFilters {
	page?: number | string | string[];
	query?: string;
}

interface PublicPostFilters {
	page?: number | string | string[];
	pageSize?: number;
}

interface TagArchiveFilters extends PublicPostFilters {
	slug: string;
}

export interface PostTagSummary {
	name: string;
	slug: string;
}

export interface PublicPostSummary {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	status: "DRAFT" | "PUBLISHED";
	statusLabel: string;
	publishedAt: Date | null;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
	wordCount: number;
	readingTimeMinutes: number;
	authorName: string;
	tags: PostTagSummary[];
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
	authorName: string;
	tags: PostTagSummary[];
}

export interface AdminPostsResult extends PaginatedPosts<AdminPostSummary> {
	filters: {
		query: string;
	};
}

export interface PublicTagArchive {
	tag: {
		name: string;
		slug: string;
	};
	posts: PaginatedPosts<PublicPostSummary>;
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
	excerpt: true,
	content: true,
	publishedAt: true,
	coverImageUrl: true,
	coverImageAlt: true,
	createdAt: true,
	updatedAt: true,
	author: {
		select: { name: true },
	},
	tags: {
		select: {
			tag: {
				select: { name: true, slug: true },
			},
		},
	},
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
	author: {
		select: { name: true },
	},
	tags: {
		select: {
			tag: {
				select: { name: true, slug: true },
			},
		},
	},
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

function mapPostTags(tags: { tag: PostTagSummary }[]) {
	return tags.map(({ tag }) => tag);
}

function mapPublicPost(record: PublicPostRecord): PublicPostSummary {
	const status = getPostStatus(record.publishedAt);
	return {
		id: record.id,
		title: record.title,
		slug: record.slug,
		excerpt: buildExcerpt(record.excerpt, record.content),
		content: record.content,
		status,
		statusLabel: formatPostStatus(status),
		publishedAt: resolveFirstPublicAt(record),
		coverImageUrl: record.coverImageUrl,
		coverImageAlt: record.coverImageAlt,
		wordCount: countWords(record.content),
		readingTimeMinutes: estimateReadingTimeMinutes(record.content),
		authorName: record.author.name || "Unknown",
		tags: mapPostTags(record.tags),
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
		authorName: record.author.name || "Unknown",
		tags: mapPostTags(record.tags),
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
				{ excerpt: { contains: filters.query, mode: "insensitive" } },
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

export async function getPublicTagArchive({
	slug,
	...filters
}: TagArchiveFilters) {
	const tag = await prisma.tag.findUnique({
		where: { slug },
		select: { name: true, slug: true },
	});

	if (!tag) {
		return null;
	}

	return {
		tag,
		posts: await getPaginatedPublicPosts(
			{
				AND: [
					buildDiscoverablePostWhere(nowDate()),
					{ tags: { some: { tag: { slug } } } },
				],
			},
			filters,
		),
	} satisfies PublicTagArchive;
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

export async function getRelatedPosts(
	postId: string,
	tags: PostTagSummary[],
	limit = 3,
) {
	if (tags.length === 0) {
		return [];
	}

	const now = nowDate();
	const tagSlugs = tags.map((tag) => tag.slug);
	const posts = await prisma.post.findMany({
		where: {
			id: { not: postId },
			AND: [
				buildDiscoverablePostWhere(now),
				{ tags: { some: { tag: { slug: { in: tagSlugs } } } } },
			],
		},
		orderBy: orderPostsByRecency(),
		take: limit * 3,
		select: publicPostSelect,
	});

	const relatedPosts = posts
		.map((post) => ({
			post: mapPublicPost(post),
			sharedTagCount: post.tags.filter(({ tag }) => tagSlugs.includes(tag.slug))
				.length,
		}))
		.sort((left, right) => {
			if (right.sharedTagCount !== left.sharedTagCount) {
				return right.sharedTagCount - left.sharedTagCount;
			}
			return right.post.publishedAt.getTime() - left.post.publishedAt.getTime();
		})
		.slice(0, limit)
		.map(({ post }) => post);

	return relatedPosts;
}

export async function getPublicSyndicationPosts(
	filters: PublicPostFilters = {},
) {
	return getPaginatedPublicPosts(buildDiscoverablePostWhere(nowDate()), {
		...filters,
		pageSize: SYNDICATION_POSTS_PER_PAGE,
	});
}

export async function getPublicTagIndex() {
	const now = nowDate();
	return await prisma.tag.findMany({
		where: {
			posts: {
				some: {
					post: buildDiscoverablePostWhere(now),
				},
			},
		},
		orderBy: { name: "asc" },
		select: { name: true, slug: true, updatedAt: true },
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
			excerpt: true,
			content: true,
			publishedAt: true,
			createdAt: true,
			updatedAt: true,
			coverImageUrl: true,
			coverImageAlt: true,
			tags: { select: { tagId: true } },
		},
	});
}

export async function getTagsForAdmin() {
	await requireAdminSession();
	return await prisma.tag.findMany({
		orderBy: { name: "asc" },
		select: {
			id: true,
			name: true,
			slug: true,
			_count: { select: { posts: true } },
		},
	});
}
