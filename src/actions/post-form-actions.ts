"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
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
		published: formData.get("published") === "on",
	};
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

	return { values, fieldErrors };
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
		return buildErrorState(values, "Please fix the highlighted fields.", fieldErrors);
	}

	if (await slugBelongsToDifferentPost(values.slug)) {
		return buildErrorState(values, null, {
			slug: "This slug is already in use.",
		});
	}

	const post = await prisma.post.create({
		data: {
			title: values.title,
			slug: values.slug,
			excerpt: values.excerpt || null,
			content: values.content,
			published: values.published,
			authorId: session.userId,
		},
		select: {
			slug: true,
		},
	});

	revalidatePath("/");
	revalidatePath(`/blog/${post.slug}`);
	revalidatePath("/admin/posts");
	redirect("/admin/posts");
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
		return buildErrorState(values, "Please fix the highlighted fields.", fieldErrors);
	}

	if (await slugBelongsToDifferentPost(values.slug, postId)) {
		return buildErrorState(values, null, {
			slug: "This slug is already in use.",
		});
	}

	const existingPost = await prisma.post.findUnique({
		where: { id: postId },
		select: { id: true },
	});
	if (!existingPost) {
		return buildErrorState(values, "That post no longer exists.");
	}

	const post = await prisma.post.update({
		where: { id: postId },
		data: {
			title: values.title,
			slug: values.slug,
			excerpt: values.excerpt || null,
			content: values.content,
			published: values.published,
		},
		select: {
			slug: true,
		},
	});

	revalidatePath("/");
	revalidatePath(`/blog/${post.slug}`);
	revalidatePath("/admin/posts");
	revalidatePath(`/admin/posts/${postId}/edit`);
	redirect("/admin/posts");
	return initialPostFormState;
}
