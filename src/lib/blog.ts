import type { PostStatus, Prisma } from "@/generated/client";
import { prisma } from "@/lib/db";

export const PUBLIC_POSTS_PER_PAGE = 10;
export const ADMIN_POSTS_PER_PAGE = 12;
const WORDS_PER_MINUTE = 200;

export function buildPublicPostWhere(now: Date = new Date()): Prisma.PostWhereInput {
	return {
		OR: [
			{ status: "DRAFT" },
			{ status: "PUBLISHED" },
			{ status: "SCHEDULED", scheduledFor: { not: null, lte: now } },
		],
	};
}

export function buildDiscoverablePostWhere(now: Date = new Date()): Prisma.PostWhereInput {
	return {
		OR: [
			{ status: "PUBLISHED" },
			{ status: "SCHEDULED", scheduledFor: { not: null, lte: now } },
		],
	};
}

export function isPostPublic(
	status: PostStatus,
	scheduledFor: Date | null,
	now: Date = new Date(),
) {
	switch (status) {
		case "ARCHIVED":
			return false;
		case "SCHEDULED":
			return scheduledFor !== null && scheduledFor <= now;
		default:
			return true;
	}
}

export function resolveFirstPublicAt(
	post: {
		status: PostStatus;
		publishedAt: Date | null;
		scheduledFor: Date | null;
		createdAt: Date;
	},
	now: Date = new Date(),
) {
	if (post.publishedAt) {
		return post.publishedAt;
	}

	if (post.status === "SCHEDULED" && post.scheduledFor && post.scheduledFor <= now) {
		return post.scheduledFor;
	}

	return post.createdAt;
}

export async function synchronizeScheduledPublicationDates(now: Date = new Date()) {
	const duePosts = await prisma.post.findMany({
		where: {
			status: "SCHEDULED",
			scheduledFor: { not: null, lte: now },
			publishedAt: null,
		},
		select: {
			id: true,
			scheduledFor: true,
		},
	});

	if (duePosts.length === 0) {
		return;
	}

	const updates = duePosts.flatMap((post) =>
		post.scheduledFor
			? [
					prisma.post.update({
						where: { id: post.id },
						data: {
							published: true,
							publishedAt: post.scheduledFor,
						},
					}),
				]
			: [],
	);

	if (updates.length > 0) {
		await prisma.$transaction(updates);
	}
}

export function estimateReadingTimeMinutes(content: string) {
	const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function stripMarkdown(content: string) {
	return content
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/[>#*_~-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function buildExcerpt(excerpt: string | null, content: string, maxLength = 180) {
	if (excerpt?.trim()) {
		return excerpt.trim();
	}

	const plainText = stripMarkdown(content);
	if (plainText.length <= maxLength) {
		return plainText;
	}

	return `${plainText.slice(0, maxLength).trimEnd()}…`;
}

export function parsePageNumber(value: number | string | string[] | undefined) {
	const rawValue = Array.isArray(value) ? value[0] : value;
	const page = typeof rawValue === "number" ? rawValue : Number.parseInt(rawValue || "1", 10);
	if (!Number.isFinite(page) || page < 1) {
		return 1;
	}
	return page;
}

export function clampPage(page: number, totalCount: number, pageSize: number) {
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	return {
		page: Math.min(page, totalPages),
		totalPages,
	};
}

export function formatPostStatus(status: PostStatus) {
	switch (status) {
		case "DRAFT":
			return "Draft";
		case "SCHEDULED":
			return "Scheduled";
		case "PUBLISHED":
			return "Published";
		case "ARCHIVED":
			return "Archived";
	}
}
