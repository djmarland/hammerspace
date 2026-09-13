import { revalidatePath } from "next/cache";
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

/**
 * Revalidates every public/admin route that a post mutation can affect.
 * Slightly over-inclusive by design: it's safer to revalidate a path that
 * didn't strictly need it than to miss one and serve stale content.
 */
function revalidatePostPaths(slugs: (string | null | undefined)[]) {
	revalidatePath("/");
	revalidatePath("/posts");
	revalidatePath("/feed.xml");
	revalidatePath("/admin/posts");
	for (const slug of new Set(
		slugs.filter((slug): slug is string => Boolean(slug)),
	)) {
		revalidatePath(`/posts/${slug}`);
	}
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

function buildPostWriteData(values: PostFormValues) {
	return {
		title: values.title,
		slug: values.slug,
		content: values.content,
		coverAssetId: values.coverAssetId || null,
	};
}

export async function createPostFromValues(values: PostFormValues) {
	if (!(await ensureAdminSession())) {
		throw new Error("Unauthorized");
	}

	const created = await prisma.post.create({
		data: {
			...buildPostWriteData(values),
			publishedAt: null,
		},
		select: {
			slug: true,
		},
	});

	revalidatePostPaths([created.slug]);
}

export async function updatePostFromValues(
	postId: string,
	values: PostFormValues,
) {
	if (!(await ensureAdminSession())) {
		throw new Error("Unauthorized");
	}

	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: {
			id: true,
			slug: true,
		},
	});
	if (!existingPost) {
		throw new Error("That post no longer exists.");
	}

	const updated = await prisma.post.update({
		where: { id: postId },
		data: buildPostWriteData(values),
		select: {
			slug: true,
		},
	});

	revalidatePostPaths([existingPost.slug, updated.slug]);
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
	if (!(await ensureAdminSession())) {
		throw new Error("Unauthorized");
	}

	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: {
			id: true,
			slug: true,
			publishedAt: true,
		},
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

	revalidatePostPaths([existingPost.slug, slug]);

	return { slug };
}

export async function unpublishPostAction(postId: string) {
	if (!(await ensureAdminSession())) {
		throw new Error("Unauthorized");
	}

	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: {
			id: true,
			slug: true,
		},
	});
	if (!existingPost) {
		throw new Error("That post no longer exists.");
	}

	await prisma.post.update({
		where: { id: postId },
		data: { publishedAt: null },
	});

	revalidatePostPaths([existingPost.slug]);
}

export async function deletePostAction(id: string) {
	if (!(await ensureAdminSession())) {
		throw new Error("Unauthorized");
	}

	const existingPost = await prisma.post.findUnique({
		where: { id },
		select: {
			slug: true,
		},
	});
	if (!existingPost) {
		throw new Error("Post not found.");
	}

	await prisma.post.delete({ where: { id } });

	revalidatePostPaths([existingPost.slug]);
}
