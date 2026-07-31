"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

function slugify(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
	if (!(await getAdminSessionUser())) throw new Error("Unauthorized");
}

function collectPostSlugs(posts: { post: { slug: string } }[]) {
	return posts.map(({ post }) => post.slug);
}

function revalidateTagSurfaces(tagSlugs: string[], postSlugs: string[]) {
	revalidatePath("/");
	revalidatePath("/blog");
	revalidatePath("/search");
	revalidatePath("/feed.xml");
	revalidatePath("/sitemap.xml");
	revalidatePath("/admin/tags");
	revalidatePath("/admin/posts");
	revalidatePath("/admin/posts/new");

	for (const tagSlug of new Set(tagSlugs)) {
		revalidatePath(`/tags/${tagSlug}`);
	}

	for (const postSlug of new Set(postSlugs)) {
		revalidatePath(`/blog/${postSlug}`);
	}
}

export async function createTagAction(formData: FormData) {
	await requireAdmin();
	const nameValue = formData.get("name");
	const name = typeof nameValue === "string" ? nameValue.trim() : "";
	const slug = slugify(name);
	if (!name || !slug) redirect("/admin/tags?error=invalid");
	const existingTag = await prisma.tag.findFirst({ where: { OR: [{ name }, { slug }] } });
	if (existingTag) redirect("/admin/tags?error=duplicate");
	await prisma.tag.create({ data: { name, slug } });
	revalidateTagSurfaces([slug], []);
	redirect("/admin/tags");
}

export async function deleteTagAction(formData: FormData) {
	await requireAdmin();
	const tagId = formData.get("tagId");
	if (typeof tagId !== "string") throw new Error("Invalid tag.");
	const existingTag = await prisma.tag.findUnique({
		where: { id: tagId },
		select: { slug: true, posts: { select: { post: { select: { slug: true } } } } },
	});
	if (!existingTag) {
		throw new Error("Tag not found.");
	}
	await prisma.tag.delete({ where: { id: tagId } });
	revalidateTagSurfaces([existingTag.slug], collectPostSlugs(existingTag.posts));
	redirect("/admin/tags");
}

export async function updateTagAction(formData: FormData) {
	await requireAdmin();
	const tagId = formData.get("tagId");
	const nameValue = formData.get("name");
	if (typeof tagId !== "string" || typeof nameValue !== "string") {
		throw new Error("Invalid tag.");
	}
	const name = nameValue.trim();
	const slug = slugify(name);
	if (!name || !slug) redirect("/admin/tags?error=invalid");
	const existingTag = await prisma.tag.findUnique({
		where: { id: tagId },
		select: { slug: true, posts: { select: { post: { select: { slug: true } } } } },
	});
	if (!existingTag) {
		throw new Error("Tag not found.");
	}
	const duplicateTag = await prisma.tag.findFirst({
		where: { id: { not: tagId }, OR: [{ name }, { slug }] },
	});
	if (duplicateTag) redirect("/admin/tags?error=duplicate");
	await prisma.tag.update({ where: { id: tagId }, data: { name, slug } });
	revalidateTagSurfaces([existingTag.slug, slug], collectPostSlugs(existingTag.posts));
	redirect("/admin/tags");
}
