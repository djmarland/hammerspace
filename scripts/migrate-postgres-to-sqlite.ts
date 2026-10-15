import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import pg from "pg";

// One-off copy of an environment's data from its old PostgreSQL database
// into its new, already-migrated SQLite database. Run it once per
// environment during the Postgres -> SQLite cutover (see README.md), from
// the install directory after `prisma migrate deploy` has created the empty
// SQLite schema:
//
//   set -a; . .env; set +a
//   node scripts/migrate-postgres-to-sqlite.ts
//
// Reads SOURCE_DATABASE_URL (the old Postgres connection string) and
// DATABASE_PATH (the SQLite file). It only depends on `pg` and Node's
// built-in `node:sqlite`, not the Prisma generated client, so it runs from a
// release install where only the built app is deployed.

// Copied in foreign-key order: credentials reference users, posts reference
// assets.
const TABLES = {
	User: [
		"id",
		"loginTokenHash",
		"name",
		"webauthnChallenge",
		"webauthnChallengeExpiresAt",
		"createdAt",
		"updatedAt",
	],
	WebAuthnCredential: [
		"id",
		"userId",
		"credentialId",
		"credentialPublicKey",
		"counter",
		"transports",
		"createdAt",
		"updatedAt",
	],
	Asset: [
		"id",
		"title",
		"alt",
		"filename",
		"mimeType",
		"size",
		"createdAt",
		"updatedAt",
	],
	Post: [
		"id",
		"title",
		"slug",
		"content",
		"publishedAt",
		"coverAssetId",
		"createdAt",
		"updatedAt",
	],
} as const;

// Prisma's TIMESTAMP(3) columns have no time zone but always hold UTC.
// node-postgres would otherwise parse them in the server's local time zone.
const TIMESTAMP_WITHOUT_TIME_ZONE_OID = 1114;
pg.types.setTypeParser(
	TIMESTAMP_WITHOUT_TIME_ZONE_OID,
	(value) => new Date(`${value.replace(" ", "T")}Z`),
);

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing ${name}`);
	}
	return value;
}

// Matches how @prisma/adapter-better-sqlite3 stores DateTime (its default
// "iso8601" timestampFormat), so Prisma reads the copied rows back unchanged.
function toSqliteValue(value: unknown): SQLInputValue {
	if (value instanceof Date) {
		return value.toISOString().replace("Z", "+00:00");
	}
	if (Array.isArray(value)) {
		// WebAuthnCredential.transports: text[] -> comma-separated string.
		return value.join(",");
	}
	return value as SQLInputValue;
}

async function main() {
	const source = new pg.Client({
		connectionString: requireEnv("SOURCE_DATABASE_URL"),
	});
	const target = new DatabaseSync(requireEnv("DATABASE_PATH"));
	target.exec("PRAGMA foreign_keys = ON");

	for (const table of Object.keys(TABLES)) {
		const { count } = target
			.prepare(`SELECT COUNT(*) AS count FROM "${table}"`)
			.get() as { count: number };
		if (count > 0) {
			throw new Error(
				`Target table "${table}" already has ${count} row(s). This script only copies into an empty, freshly migrated database.`,
			);
		}
	}

	await source.connect();
	try {
		target.exec("BEGIN");
		for (const [table, columns] of Object.entries(TABLES)) {
			const columnList = columns.map((column) => `"${column}"`).join(", ");
			const { rows } = await source.query(
				`SELECT ${columnList} FROM "${table}"`,
			);
			const insert = target.prepare(
				`INSERT INTO "${table}" (${columnList}) VALUES (${columns.map(() => "?").join(", ")})`,
			);
			for (const row of rows) {
				insert.run(...columns.map((column) => toSqliteValue(row[column])));
			}
			console.log(`${table}: copied ${rows.length} row(s)`);
		}
		target.exec("COMMIT");
	} catch (error) {
		target.exec("ROLLBACK");
		throw error;
	} finally {
		await source.end();
		target.close();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
