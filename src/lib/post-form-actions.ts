import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
	formatSlugDateSuffix,
	nowDate,
	parseDateTimeLocalAsDate,
} from "@/lib/temporal";
import type { PostFormValues, PublishFormValues } from "@/lib/post-form";

export async function ensureAdminSession() {
	return getAdminSessionUser();
}

export async function slugBelongsToDifferentPost(
	slug: string,
	postId?: string,
) {
	const postWithSlug = await prisma.post.findUnique({
		where: { slug },
		select: { id: true },
	});
	if (!postWithSlug) {
		return false;
	}
	if (postId && postWithSlug.id === postId) {
		return false;
	}
	return true;
}

export async function validateTagIds(tagIds: string[]) {
	if (tagIds.length === 0) return true;
	const count = await prisma.tag.count({ where: { id: { in: tagIds } } });
	return count === new Set(tagIds).size;
}

function tagRelations(tagIds: string[]) {
	return { create: [...new Set(tagIds)].map((tagId) => ({ tagId })) };
}

function buildPostWriteData(values: PostFormValues) {
	return {
		title: values.title,
		slug: values.slug,
		excerpt: values.excerpt || null,
		content: values.content,
		coverImageUrl: values.coverImageUrl || null,
		coverImageAlt: values.coverImageAlt || null,
	};
}

export async function createPostFromValues(
	values: PostFormValues,
	authorId: string,
) {
	await prisma.post.create({
		data: {
			...buildPostWriteData(values),
			publishedAt: null,
			tags: tagRelations(values.tagIds),
			authorId,
		},
		select: {
			slug: true,
			tags: { select: { tag: { select: { slug: true } } } },
		},
	});
}

export async function updatePostFromValues(
	postId: string,
	values: PostFormValues,
) {
	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: { id: true },
	});
	if (!existingPost) {
		throw new Error("That post no longer exists.");
	}

	await prisma.post.update({
		where: { id: postId },
		data: {
			...buildPostWriteData(values),
			tags: {
				deleteMany: {},
				...tagRelations(values.tagIds),
			},
		},
		select: {
			slug: true,
			tags: { select: { tag: { select: { slug: true } } } },
		},
	});
}

async function buildUniquePublishSlug(
	baseSlug: string,
	publishedAt: Date,
	postId: string,
) {
	const suffix = formatSlugDateSuffix(publishedAt);
	let candidate = `${baseSlug}${suffix}`;
	let attempt = 2;
	while (await slugBelongsToDifferentPost(candidate, postId)) {
		candidate = `${baseSlug}${suffix}-${attempt}`;
		attempt += 1;
	}
	return candidate;
}

/**
 * Publishes a post at the given date/time using the (optionally edited)
 * slug. If the post is currently a Draft (no publishedAt), this is treated
 * as its first publication and a "-mm-yyyy" suffix (from the chosen publish
 * date) is appended to the slug. Rescheduling an already-published post uses
 * the supplied slug as-is (the caller is expected to have already checked
 * it doesn't collide with another post).
 */
export async function publishPostAction(
	postId: string,
	values: PublishFormValues,
) {
	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: { id: true, slug: true, publishedAt: true },
	});
	if (!existingPost) {
		throw new Error("That post no longer exists.");
	}

	const publishDate = parseDateTimeLocalAsDate(values.publishedAt) ?? nowDate();
	const slug = existingPost.publishedAt
		? values.slug
		: await buildUniquePublishSlug(values.slug, publishDate, postId);

	await prisma.post.update({
		where: { id: postId },
		data: { publishedAt: publishDate, slug },
	});

	return { slug };
}

export async function unpublishPostAction(postId: string) {
	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: { id: true },
	});
	if (!existingPost) {
		throw new Error("That post no longer exists.");
	}

	await prisma.post.update({
		where: { id: postId },
		data: { publishedAt: null },
	});
}

export async function deletePostAction(id: string) {
	if (!(await ensureAdminSession())) {
		throw new Error("Unauthorized");
	}

	const existingPost = await prisma.post.findUnique({ where: { id } });
	if (!existingPost) {
		throw new Error("Post not found.");
	}

	await prisma.post.delete({ where: { id } });
}
