import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

export type TweetKind = "tweet" | "retweet" | "reply";
export type TweetMediaType = "photo" | "video" | "animated_gif";

export type TweetSegment =
	| { type: "text"; value: string }
	| { type: "url"; href: string; display: string }
	| { type: "mention"; screenName: string }
	| { type: "hashtag"; tag: string };

export interface TweetMedia {
	type: TweetMediaType;
	url: string;
	width: number;
	height: number;
}

export interface Tweet {
	id: string;
	createdAt: Date;
	kind: TweetKind;
	inReplyToId: string | null;
	threadRootId: string;
	retweetedScreenName: string | null;
	text: string;
	segments: TweetSegment[];
	favoriteCount: number;
	retweetCount: number;
	media: TweetMedia[];
}

export interface TweetProfile {
	username: string;
	displayName: string;
	avatarUrl: string | null;
}

export interface TweetYearCount {
	year: number;
	count: number;
}

interface TweetRow {
	id: string;
	created_at: string;
	kind: TweetKind;
	in_reply_to_id: string | null;
	thread_root_id: string;
	retweeted_screen_name: string | null;
	text: string;
	segments: string;
	favorite_count: number;
	retweet_count: number;
}

interface MediaRow {
	tweet_id: string;
	type: TweetMediaType;
	filename: string;
	width: number;
	height: number;
}

const globalForTweets = global as unknown as {
	tweetsDb?: DatabaseSync | null;
};

function getDb() {
	if (globalForTweets.tweetsDb !== undefined) {
		return globalForTweets.tweetsDb;
	}
	const dbPath = process.env.TWEETS_DATABASE_PATH;
	const db =
		dbPath && existsSync(dbPath)
			? new DatabaseSync(dbPath, { readOnly: true })
			: null;
	if (db) {
		globalForTweets.tweetsDb = db;
	}
	return db;
}

export function isTweetArchiveAvailable() {
	return getDb() !== null;
}

function mediaUrl(filename: string) {
	const base = (process.env.TWEETS_MEDIA_URL ?? "").replace(/\/$/, "");
	return `${base}/${encodeURIComponent(filename)}`;
}

function hydrate(db: DatabaseSync, rows: TweetRow[]): Tweet[] {
	const mediaRows = db
		.prepare(
			`SELECT tweet_id, type, filename, width, height FROM media
			WHERE tweet_id IN (SELECT value FROM json_each(?))
			ORDER BY tweet_id, position`,
		)
		.all(JSON.stringify(rows.map((row) => row.id))) as unknown as MediaRow[];
	const mediaByTweet = Map.groupBy(mediaRows, (row) => row.tweet_id);

	return rows.map((row) => ({
		id: row.id,
		createdAt: new Date(row.created_at),
		kind: row.kind,
		inReplyToId: row.in_reply_to_id,
		threadRootId: row.thread_root_id,
		retweetedScreenName: row.retweeted_screen_name,
		text: row.text,
		segments: JSON.parse(row.segments),
		favoriteCount: row.favorite_count,
		retweetCount: row.retweet_count,
		media: (mediaByTweet.get(row.id) ?? []).map((media) => ({
			type: media.type,
			url: mediaUrl(media.filename),
			width: media.width,
			height: media.height,
		})),
	}));
}

function queryTweets(sql: string, ...params: (string | number)[]) {
	const db = getDb();
	if (!db) {
		return null;
	}
	const rows = db.prepare(sql).all(...params) as unknown as TweetRow[];
	return hydrate(db, rows);
}

export function getTweetProfile(): TweetProfile | null {
	const row = getDb()
		?.prepare(
			"SELECT username, display_name, avatar_filename FROM profile LIMIT 1",
		)
		.get() as
		| { username: string; display_name: string; avatar_filename: string | null }
		| undefined;
	if (!row) {
		return null;
	}
	return {
		username: row.username,
		displayName: row.display_name,
		avatarUrl: row.avatar_filename ? mediaUrl(row.avatar_filename) : null,
	};
}

export function getLatestTweets(limit = 50) {
	return queryTweets(
		"SELECT * FROM tweets ORDER BY created_at DESC LIMIT ?",
		limit,
	);
}

export function getTweetsForYear(year: number) {
	return queryTweets(
		"SELECT * FROM tweets WHERE year = ? ORDER BY created_at",
		year,
	);
}

export function getTweetThread(id: string) {
	return queryTweets(
		`SELECT * FROM tweets
		WHERE thread_root_id = (SELECT thread_root_id FROM tweets WHERE id = ?)
		ORDER BY created_at`,
		id,
	);
}

export function getTweetYears(): TweetYearCount[] {
	return (getDb()
		?.prepare(
			"SELECT year, count(*) AS count FROM tweets GROUP BY year ORDER BY year",
		)
		.all() ?? []) as unknown as TweetYearCount[];
}

const londonYearFormatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Europe/London",
	year: "numeric",
});

export function tweetYearOf(date: Date) {
	return Number(londonYearFormatter.format(date));
}
