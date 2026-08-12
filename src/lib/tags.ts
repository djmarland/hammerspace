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

export async function createTagAction(formData: FormData) {
	await requireAdmin();
	const nameValue = formData.get("name");
	const name = typeof nameValue === "string" ? nameValue.trim() : "";
	const slug = slugify(name);
	if (!name || !slug) throw new Error("Invalid tag name");
	const existingTag = await prisma.tag.findFirst({ where: { OR: [{ name }, { slug }] } });
	if (existingTag) throw new Error("Tag already exists");
	await prisma.tag.create({ data: { name, slug } });
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
	if (!name || !slug) throw new Error("Invalid tag name");
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
	if (duplicateTag) throw new Error("Tag name already exists");
	await prisma.tag.update({ where: { id: tagId }, data: { name, slug } });
}
