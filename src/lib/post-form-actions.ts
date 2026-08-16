import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
	nowDate,
	parseDateTimeLocalAsDate,
	isValidDateTimeLocal,
} from "@/lib/temporal";
import {
	initialPostFormState,
	type PostFieldName,
	type PostFormState,
	type PostFormValues,
} from "@/lib/post-form";

interface ValidatedPostPayload {
	values: PostFormValues;
	fieldErrors: Partial<Record<PostFieldName, string>>;
}

function normalizeWhitespace(value: FormDataEntryValue | null): string {
	if (typeof value !== "string") {
		return "";
	}
	return value.trim();
}

function parsePostFormData(formData: FormData): PostFormValues {
	return {
		title: normalizeWhitespace(formData.get("title")),
		slug: normalizeWhitespace(formData.get("slug")).toLowerCase(),
		excerpt: normalizeWhitespace(formData.get("excerpt")),
		content: normalizeWhitespace(formData.get("content")),
		isPublished:
			formData.get("isPublished") === "on" ||
			formData.get("isPublished") === "true",
		publishedAt: normalizeWhitespace(formData.get("publishedAt")),
		coverImageUrl: normalizeWhitespace(formData.get("coverImageUrl")),
		coverImageAlt: normalizeWhitespace(formData.get("coverImageAlt")),
		tagIds: formData
			.getAll("tagIds")
			.filter((value): value is string => typeof value === "string"),
	};
}

function parseOptionalUrl(value: string): boolean {
	if (!value) return true;
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:";
	} catch {
		return false;
	}
}

function validatePostValues(values: PostFormValues): ValidatedPostPayload {
	const fieldErrors: Partial<Record<PostFieldName, string>> = {};
	const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

	if (!values.title) {
		fieldErrors.title = "Title is required.";
	}

	if (!values.slug) {
		fieldErrors.slug = "Slug is required.";
	} else if (!slugRegex.test(values.slug)) {
		fieldErrors.slug =
			"Slug must use lowercase letters, numbers, and hyphens only.";
	}

	if (!values.content) {
		fieldErrors.content = "Content is required.";
	}
	if (values.isPublished && !values.publishedAt) {
		fieldErrors.publishedAt = "Choose a publish date and time.";
	} else if (values.isPublished && !isValidDateTimeLocal(values.publishedAt)) {
		fieldErrors.publishedAt = "Enter a valid publication date and time.";
	}
	if (!parseOptionalUrl(values.coverImageUrl)) {
		fieldErrors.coverImageUrl = "Use an absolute http or https URL.";
	} else if (values.coverImageUrl && !values.coverImageAlt) {
		fieldErrors.coverImageAlt = "Describe the cover image for screen readers.";
	}
	return { values, fieldErrors };
}

function buildPostWriteData(
	values: PostFormValues,
	existingPost?: { publishedAt: Date | null },
) {
	const now = nowDate();
	const publishDate = values.isPublished
		? (parseDateTimeLocalAsDate(values.publishedAt) ??
			existingPost?.publishedAt ??
			now)
		: null;

	return {
		title: values.title,
		slug: values.slug,
		excerpt: values.excerpt || null,
		content: values.content,
		publishedAt: publishDate,
		coverImageUrl: values.coverImageUrl || null,
		coverImageAlt: values.coverImageAlt || null,
	};
}

async function validateTagIds(tagIds: string[]) {
	if (tagIds.length === 0) return true;
	const count = await prisma.tag.count({ where: { id: { in: tagIds } } });
	return count === new Set(tagIds).size;
}

function tagRelations(tagIds: string[]) {
	return { create: [...new Set(tagIds)].map((tagId) => ({ tagId })) };
}

async function ensureAdminSession() {
	const session = await getAdminSessionUser();
	if (!session) {
		return null;
	}
	return session;
}

async function slugBelongsToDifferentPost(slug: string, postId?: string) {
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

function buildErrorState(
	values: PostFormValues,
	formError: string | null,
	fieldErrors: Partial<Record<PostFieldName, string>> = {},
): PostFormState {
	return {
		formError,
		fieldErrors,
		values,
	};
}

export async function createPostAction(
	_prevState: PostFormState | undefined,
	formData: FormData,
): Promise<PostFormState> {
	const session = await ensureAdminSession();
	const values = parsePostFormData(formData);
	if (!session) {
		return buildErrorState(values, "You must be logged in as an admin.");
	}

	const { fieldErrors } = validatePostValues(values);
	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(
			values,
			"Please fix the highlighted fields.",
			fieldErrors,
		);
	}

	if (await slugBelongsToDifferentPost(values.slug)) {
		return buildErrorState(values, null, {
			slug: "This slug is already in use.",
		});
	}
	if (!(await validateTagIds(values.tagIds))) {
		return buildErrorState(
			values,
			"One or more selected tags no longer exist.",
		);
	}

	await prisma.post.create({
		data: {
			...buildPostWriteData(values),
			tags: tagRelations(values.tagIds),
			authorId: session.userId,
		},
		select: {
			slug: true,
			tags: { select: { tag: { select: { slug: true } } } },
		},
	});

	return initialPostFormState;
}

export async function updatePostAction(
	postId: string,
	_prevState: PostFormState | undefined,
	formData: FormData,
): Promise<PostFormState> {
	const session = await ensureAdminSession();
	const values = parsePostFormData(formData);
	if (!session) {
		return buildErrorState(values, "You must be logged in as an admin.");
	}

	const { fieldErrors } = validatePostValues(values);
	if (Object.keys(fieldErrors).length > 0) {
		return buildErrorState(
			values,
			"Please fix the highlighted fields.",
			fieldErrors,
		);
	}

	if (await slugBelongsToDifferentPost(values.slug, postId)) {
		return buildErrorState(values, null, {
			slug: "This slug is already in use.",
		});
	}
	if (!(await validateTagIds(values.tagIds))) {
		return buildErrorState(
			values,
			"One or more selected tags no longer exist.",
		);
	}

	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: {
			id: true,
			slug: true,
			publishedAt: true,
			tags: { select: { tag: { select: { slug: true } } } },
		},
	});
	if (!existingPost) {
		return buildErrorState(values, "That post no longer exists.");
	}

	await prisma.post.update({
		where: { id: postId },
		data: {
			...buildPostWriteData(values, existingPost),
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

	return initialPostFormState;
}

export async function deletePostAction(formData: FormData) {
	if (!(await ensureAdminSession())) {
		throw new Error("Unauthorized");
	}

	const postId = formData.get("postId");
	if (typeof postId !== "string") {
		throw new Error("Invalid post.");
	}

	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: {
			slug: true,
			tags: { select: { tag: { select: { slug: true } } } },
		},
	});
	if (!existingPost) {
		throw new Error("Post not found.");
	}

	await prisma.post.delete({ where: { id: postId } });
}
