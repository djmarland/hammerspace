import "dotenv/config";
import { PrismaClient } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createRawLoginToken, hashLoginToken } from "../src/lib/login-token";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function getAppUrl(): string {
	return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
		/\/+$/,
		"",
	);
}

async function main() {
	const existingAdmin = await prisma.user.findFirst({
		where: { isAdmin: true },
		select: { id: true },
	});

	if (existingAdmin) {
		throw new Error("Admin user already exists");
	}

	const rawToken = createRawLoginToken();
	const loginTokenHash = hashLoginToken(rawToken);

	const admin = await prisma.user.create({
		data: {
			isAdmin: true,
			name: "Admin",
			loginTokenHash,
		},
		select: { id: true },
	});

	const loginUrl = `${getAppUrl()}/admin/login?token=${encodeURIComponent(rawToken)}`;

	console.log(`Created initial admin user: ${admin.id}`);
	console.log(`Login URL (one-time token): ${loginUrl}`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error instanceof Error ? error.message : error);
		await prisma.$disconnect();
		process.exit(1);
	});
