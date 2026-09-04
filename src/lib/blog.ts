import type { Prisma } from "@/generated/client";
import { nowDate } from "@/lib/temporal";

export const PUBLIC_POSTS_PER_PAGE = 10;
export const ADMIN_POSTS_PER_PAGE = 12;
export const SYNDICATION_POSTS_PER_PAGE = 20;
const WORDS_PER_MINUTE = 200;

export function buildDiscoverablePostWhere(
	now: Date = nowDate(),
): Prisma.PostWhereInput {
	return {
		publishedAt: { not: null, lte: now },
	};
}

export function isPostPublic(publishedAt: Date | null, now: Date = nowDate()) {
	return publishedAt !== null && publishedAt <= now;
}

export function resolveFirstPublicAt(post: {
	publishedAt: Date | null;
	createdAt: Date;
}) {
	return post.publishedAt ?? post.createdAt;
}

export function countWords(content: string) {
	const plainText = stripMarkdown(content);
	return plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
}

export function estimateReadingTimeMinutes(
	content: string,
	wordsPerMinute = WORDS_PER_MINUTE,
) {
	const wordCount = countWords(content);
	return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
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

export function buildExcerpt(
	excerpt: string | null,
	content: string,
	maxLength = 180,
) {
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
	const page =
		typeof rawValue === "number"
			? rawValue
			: Number.parseInt(rawValue || "1", 10);
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

export function formatPostStatus(status: "DRAFT" | "PUBLISHED") {
	switch (status) {
		case "DRAFT":
			return "Draft";
		case "PUBLISHED":
			return "Published";
	}
}
