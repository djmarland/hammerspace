import "dotenv/config";
import { PrismaClient } from "@/generated/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
	url: process.env.DATABASE_PATH!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Database seed started...");
	// Add your seed logic here
	console.log("Database seed completed.");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
