import "dotenv/config";
import crypto from "crypto";

// Prints a SQL statement to create the initial admin user, plus the
// one-time login URL for it. Run manually against the production database,
// e.g.:
//
//   npm run admin:create-initial | sqlite3 "$DATABASE_PATH"
//
// This intentionally avoids depending on the Prisma generated client, so it
// works even in environments where only the built app (no `src/generated`)
// is deployed.

function getTokenSecret(): string {
	const secret =
		process.env.LOGIN_TOKEN_SECRET ??
		process.env.AUTH_JWT_SECRET ??
		process.env.AUTH_SECRET;
	if (!secret) {
		throw new Error(
			"Missing LOGIN_TOKEN_SECRET (or AUTH_JWT_SECRET/AUTH_SECRET)",
		);
	}
	return secret;
}

function hashLoginToken(rawToken: string): string {
	return crypto
		.createHmac("sha256", getTokenSecret())
		.update(rawToken)
		.digest("hex");
}

function createRawLoginToken(): string {
	return crypto.randomBytes(32).toString("base64url");
}

function getAppUrl(): string {
	return (process.env.PUBLIC_APP_URL || "http://localhost:3000").replace(
		/\/+$/,
		"",
	);
}

function sqlQuote(value: string): string {
	return `'${value.replace(/'/g, "''")}'`;
}

// Matches how @prisma/adapter-better-sqlite3 stores DateTime. SQLite's own
// CURRENT_TIMESTAMP uses a different format ("YYYY-MM-DD HH:MM:SS").
function sqliteTimestamp(date: Date): string {
	return date.toISOString().replace("Z", "+00:00");
}

function main() {
	const id = crypto.randomUUID();
	const rawToken = createRawLoginToken();
	const loginTokenHash = hashLoginToken(rawToken);
	const loginUrl = `${getAppUrl()}/admin/login?token=${encodeURIComponent(rawToken)}&userId=${encodeURIComponent(id)}`;

	const now = sqlQuote(sqliteTimestamp(new Date()));

	const sql = `INSERT INTO "User" ("id", "loginTokenHash", "name", "createdAt", "updatedAt")
VALUES (${sqlQuote(id)}, ${sqlQuote(loginTokenHash)}, 'Admin', ${now}, ${now});`;

	console.log(sql);
	console.error(""); // blank line separator on stderr, keeps stdout SQL-only
	console.error(`Login URL (one-time token): ${loginUrl}`);
	console.error("Run the SQL above against the production database, e.g.:");
	console.error(`  npm run admin:create-initial | sqlite3 "$DATABASE_PATH"`);
}

main();
