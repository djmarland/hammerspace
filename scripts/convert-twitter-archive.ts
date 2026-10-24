import {
	copyFileSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
} from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { isLinkedMediaCandidate, resolveLinkedMedia } from "./linked-media.ts";
import type { LinkedMedia } from "./linked-media.ts";
import type {
	TweetKind,
	TweetMediaType,
	TweetSegment,
} from "../src/lib/tweets.ts";

interface ArchiveEntity {
	indices: [string, string];
}

interface ArchiveUrl extends ArchiveEntity {
	url: string;
	expanded_url: string;
	display_url: string;
}

interface ArchiveMention extends ArchiveEntity {
	screen_name: string;
}

interface ArchiveHashtag extends ArchiveEntity {
	text: string;
}

interface ArchiveMedia extends ArchiveEntity {
	url: string;
	type: TweetMediaType;
	media_url_https: string;
	sizes: { large: { w: string; h: string } };
	video_info?: {
		variants: { content_type: string; url: string; bitrate?: string }[];
	};
}

interface ArchiveTweet {
	id_str: string;
	created_at: string;
	full_text: string;
	display_text_range: [string, string];
	favorite_count: string;
	retweet_count: string;
	in_reply_to_status_id_str?: string;
	in_reply_to_user_id_str?: string;
	entities: {
		urls: ArchiveUrl[];
		user_mentions: ArchiveMention[];
		hashtags: ArchiveHashtag[];
		media?: ArchiveMedia[];
	};
	extended_entities?: { media: ArchiveMedia[] };
}

const archiveDir = process.argv[2];
if (!archiveDir) {
	console.error(
		'Usage: node scripts/convert-twitter-archive.ts "<archive dir>" [out dir]',
	);
	process.exit(1);
}

const dataDir = path.join(archiveDir, "data");
const outDir = path.resolve(
	process.argv[3] ?? path.join(import.meta.dirname, "..", "build", "tweets"),
);
const dbPath = path.join(outDir, "tweets.db");
const mediaOutDir = path.join(outDir, "media");
const linkedCacheDir = path.join(outDir, "linked-cache");

function readArchiveFile<T>(filename: string): T[] {
	const source = readFileSync(path.join(dataDir, filename), "utf8");
	return JSON.parse(source.slice(source.indexOf("=") + 1));
}

function decodeHtml(text: string) {
	return text
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&amp;", "&");
}

const londonYearFormatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Europe/London",
	year: "numeric",
});

type PlacedSegment = { start: number; end: number; segment: TweetSegment };

function buildSegments(
	tweet: ArchiveTweet,
	start: number,
	end: number,
): TweetSegment[] {
	const chars = Array.from(tweet.full_text);
	const placed: PlacedSegment[] = [];
	const place = (entity: ArchiveEntity, segment: TweetSegment) => {
		const entityStart = Number(entity.indices[0]);
		const entityEnd = Number(entity.indices[1]);
		if (entityStart >= start && entityEnd <= end) {
			placed.push({ start: entityStart, end: entityEnd, segment });
		}
	};

	for (const url of tweet.entities.urls) {
		place(url, {
			type: "url",
			href: url.expanded_url,
			display: url.display_url,
		});
	}
	for (const mention of tweet.entities.user_mentions) {
		place(mention, { type: "mention", screenName: mention.screen_name });
	}
	for (const hashtag of tweet.entities.hashtags) {
		place(hashtag, { type: "hashtag", tag: hashtag.text });
	}
	for (const media of tweet.entities.media ?? []) {
		place(media, { type: "text", value: "" });
	}
	placed.sort((a, b) => a.start - b.start);

	const segments: TweetSegment[] = [];
	const pushText = (from: number, to: number) => {
		if (to > from) {
			segments.push({
				type: "text",
				value: decodeHtml(chars.slice(from, to).join("")),
			});
		}
	};
	let cursor = start;
	for (const item of placed) {
		if (item.start < cursor) {
			continue;
		}
		pushText(cursor, item.start);
		if (item.segment.type !== "text") {
			segments.push(item.segment);
		}
		cursor = item.end;
	}
	pushText(cursor, end);

	return trimSegments(segments).flatMap(autoLink);
}

function trimSegments(segments: TweetSegment[]) {
	const last = segments.at(-1);
	if (last?.type === "text") {
		last.value = last.value.trimEnd();
		if (!last.value) {
			segments.pop();
		}
	}
	const first = segments[0];
	if (first?.type === "text") {
		first.value = first.value.trimStart();
		if (!first.value) {
			segments.shift();
		}
	}
	return segments;
}

function withoutLinkedMedia(
	segments: TweetSegment[],
	linkedMedia: Map<string, LinkedMedia>,
) {
	const result: TweetSegment[] = [];
	let stripSeparator = false;
	segments.forEach((segment, index) => {
		const before = result.length > 0 && segmentsToText(result).trim() !== "";
		const next = segments[index + 1];
		if (segment.type === "url" && linkedMedia.has(segment.href)) {
			const midSentence =
				before && next?.type === "text" && /\w/.test(next.value);
			if (!midSentence) {
				stripSeparator = !before;
				return;
			}
		}
		const copy = { ...segment };
		if (stripSeparator && copy.type === "text") {
			copy.value = copy.value.replace(/^\s*[-–:]?\s*/, "");
		}
		stripSeparator = false;
		const previous = result.at(-1);
		if (copy.type === "text" && previous?.type === "text") {
			previous.value = `${previous.value.trimEnd()} ${copy.value.trimStart()}`;
		} else {
			result.push(copy);
		}
	});
	return trimSegments(result);
}

const autoLinkPattern =
	/(?<![\w@#/])(?:((?:https?:\/\/|www\.)[^\s<>"“”]+)|@(\w{1,15})|#(\p{L}[\p{L}\p{N}_]*))/gu;

function urlSegment(match: string): TweetSegment | null {
	const url = match.replace(/[.,;:!?)\]'"’]+$/u, "");
	if (url.endsWith("…") || url.endsWith("...")) {
		return null;
	}
	const href = url.startsWith("www.") ? `http://${url}` : url;
	try {
		const { hostname, pathname } = new URL(href);
		if (!hostname.includes(".") || (hostname === "t.co" && pathname === "/")) {
			return null;
		}
	} catch {
		return null;
	}
	return { type: "url", href, display: url };
}

function autoLink(segment: TweetSegment): TweetSegment[] {
	if (segment.type !== "text") {
		return [segment];
	}
	const result: TweetSegment[] = [];
	let cursor = 0;
	const pushText = (value: string) => {
		if (!value) {
			return;
		}
		const previous = result.at(-1);
		if (previous?.type === "text") {
			previous.value += value;
		} else {
			result.push({ type: "text", value });
		}
	};
	for (const match of segment.value.matchAll(autoLinkPattern)) {
		const [whole, url, screenName, tag] = match;
		let linked: TweetSegment | null;
		let length = whole.length;
		if (url) {
			linked = urlSegment(url);
			if (linked?.type === "url") {
				length = linked.display.length;
			}
		} else if (screenName) {
			linked = { type: "mention", screenName };
		} else {
			linked = { type: "hashtag", tag };
		}
		if (!linked) {
			continue;
		}
		pushText(segment.value.slice(cursor, match.index));
		result.push(linked);
		cursor = match.index + length;
	}
	pushText(segment.value.slice(cursor));
	return result;
}

function segmentsToText(segments: TweetSegment[]) {
	return segments
		.map((segment) => {
			switch (segment.type) {
				case "text":
					return segment.value;
				case "url":
					return segment.display;
				case "mention":
					return `@${segment.screenName}`;
				case "hashtag":
					return `#${segment.tag}`;
			}
		})
		.join("");
}

const account = readArchiveFile<{
	account: { accountId: string; username: string; accountDisplayName: string };
}>("account.js")[0].account;
const profile = readArchiveFile<{ profile: { avatarMediaUrl?: string } }>(
	"profile.js",
)[0].profile;

const tweetFiles = readdirSync(dataDir)
	.filter((filename) => /^tweets(-part\d+)?\.js$/.test(filename))
	.sort();
const allTweets = tweetFiles.flatMap((filename) =>
	readArchiveFile<{ tweet: ArchiveTweet }>(filename).map((item) => item.tweet),
);

const keptTweets = allTweets.filter(
	(tweet) =>
		!tweet.in_reply_to_status_id_str ||
		tweet.in_reply_to_user_id_str === account.accountId,
);
const keptById = new Map(keptTweets.map((tweet) => [tweet.id_str, tweet]));

function threadRootId(tweet: ArchiveTweet) {
	let current = tweet;
	const seen = new Set<string>();
	while (current.in_reply_to_status_id_str && !seen.has(current.id_str)) {
		seen.add(current.id_str);
		const parent = keptById.get(current.in_reply_to_status_id_str);
		if (!parent) {
			break;
		}
		current = parent;
	}
	return current.id_str;
}

const archiveMediaDir = path.join(dataDir, "tweets_media");
const archiveMediaFiles = readdirSync(archiveMediaDir);
const archiveMediaSet = new Set(archiveMediaFiles);

function basenameOf(url: string) {
	return new URL(url).pathname.split("/").pop()!;
}

function findMediaFile(
	tweetId: string,
	media: ArchiveMedia,
	used: Set<string>,
) {
	const isVideo = media.type !== "photo";
	const candidates = isVideo
		? (media.video_info?.variants ?? [])
				.filter((variant) => variant.content_type === "video/mp4")
				.sort((a, b) => Number(b.bitrate ?? 0) - Number(a.bitrate ?? 0))
				.map((variant) => basenameOf(variant.url))
		: [basenameOf(media.media_url_https)];
	for (const candidate of candidates) {
		const filename = `${tweetId}-${candidate}`;
		if (archiveMediaSet.has(filename)) {
			return filename;
		}
	}
	return archiveMediaFiles.find(
		(filename) =>
			filename.startsWith(`${tweetId}-`) &&
			!used.has(filename) &&
			filename.endsWith(".mp4") === isVideo,
	);
}

function tweetShape(tweet: ArchiveTweet) {
	const retweet = /^RT @(\w+): /.exec(tweet.full_text);
	const kind: TweetKind = retweet
		? "retweet"
		: tweet.in_reply_to_status_id_str
			? "reply"
			: "tweet";
	const start = retweet
		? Array.from(retweet[0]).length
		: Number(tweet.display_text_range[0]);
	const end = Number(tweet.display_text_range[1]);
	return { retweet, kind, segments: buildSegments(tweet, start, end) };
}

const shapes = new Map(
	keptTweets.map((tweet) => [tweet.id_str, tweetShape(tweet)]),
);
const linkedMedia = await resolveLinkedMedia(
	[
		...new Set(
			[...shapes.values()].flatMap(({ segments }) =>
				segments.flatMap((segment) =>
					segment.type === "url" && isLinkedMediaCandidate(segment.href)
						? [segment.href]
						: [],
				),
			),
		),
	],
	linkedCacheDir,
);

rmSync(dbPath, { force: true });
mkdirSync(mediaOutDir, { recursive: true });
for (const filename of readdirSync(mediaOutDir)) {
	rmSync(path.join(mediaOutDir, filename), { recursive: true, force: true });
}

const db = new DatabaseSync(dbPath);
db.exec(`
	CREATE TABLE tweets (
		id TEXT PRIMARY KEY,
		created_at TEXT NOT NULL,
		year INTEGER NOT NULL,
		kind TEXT NOT NULL,
		in_reply_to_id TEXT,
		thread_root_id TEXT NOT NULL,
		retweeted_screen_name TEXT,
		text TEXT NOT NULL,
		segments TEXT NOT NULL,
		favorite_count INTEGER NOT NULL,
		retweet_count INTEGER NOT NULL
	);
	CREATE INDEX tweets_created_at ON tweets (created_at);
	CREATE INDEX tweets_year ON tweets (year);
	CREATE INDEX tweets_thread_root_id ON tweets (thread_root_id);
	CREATE TABLE media (
		tweet_id TEXT NOT NULL REFERENCES tweets (id),
		position INTEGER NOT NULL,
		type TEXT NOT NULL,
		filename TEXT NOT NULL,
		width INTEGER NOT NULL,
		height INTEGER NOT NULL,
		PRIMARY KEY (tweet_id, position)
	);
	CREATE TABLE profile (
		username TEXT NOT NULL,
		display_name TEXT NOT NULL,
		avatar_filename TEXT
	);
`);

const insertTweet = db.prepare(`
	INSERT INTO tweets (id, created_at, year, kind, in_reply_to_id,
		thread_root_id, retweeted_screen_name, text, segments, favorite_count,
		retweet_count)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertMedia = db.prepare(`
	INSERT INTO media (tweet_id, position, type, filename, width, height)
	VALUES (?, ?, ?, ?, ?, ?)
`);

const kindCounts: Record<TweetKind, number> = {
	tweet: 0,
	retweet: 0,
	reply: 0,
};
const missingMedia: string[] = [];
let mediaCopied = 0;
let linkedEmbedded = 0;
let orphanedReplies = 0;

db.exec("BEGIN");
for (const tweet of keptTweets) {
	const createdAt = new Date(tweet.created_at);
	const year = Number(londonYearFormatter.format(createdAt));
	const shape = shapes.get(tweet.id_str)!;
	const { retweet, kind } = shape;
	kindCounts[kind]++;

	const segments = withoutLinkedMedia(shape.segments, linkedMedia);
	const linked = shape.segments.flatMap((segment) => {
		const media = segment.type === "url" && linkedMedia.get(segment.href);
		return media ? [media] : [];
	});

	const inReplyToId =
		kind === "reply" ? tweet.in_reply_to_status_id_str! : null;
	if (inReplyToId && !keptById.has(inReplyToId)) {
		orphanedReplies++;
	}

	insertTweet.run(
		tweet.id_str,
		createdAt.toISOString(),
		year,
		kind,
		inReplyToId,
		threadRootId(tweet),
		retweet?.[1] ?? null,
		segmentsToText(segments),
		JSON.stringify(segments),
		kind === "retweet" ? 0 : Number(tweet.favorite_count),
		kind === "retweet" ? 0 : Number(tweet.retweet_count),
	);

	const used = new Set<string>();
	(tweet.extended_entities?.media ?? []).forEach((media, position) => {
		const filename = findMediaFile(tweet.id_str, media, used);
		if (!filename) {
			missingMedia.push(`${tweet.id_str} (${media.type})`);
			return;
		}
		used.add(filename);
		copyFileSync(
			path.join(archiveMediaDir, filename),
			path.join(mediaOutDir, filename),
		);
		mediaCopied++;
		insertMedia.run(
			tweet.id_str,
			position,
			media.type,
			filename,
			Number(media.sizes.large.w),
			Number(media.sizes.large.h),
		);
	});

	const firstLinkedPosition = tweet.extended_entities?.media.length ?? 0;
	linked.forEach((media, index) => {
		const filename = `${tweet.id_str}-${media.file}`;
		copyFileSync(
			path.join(linkedCacheDir, media.file),
			path.join(mediaOutDir, filename),
		);
		linkedEmbedded++;
		insertMedia.run(
			tweet.id_str,
			firstLinkedPosition + index,
			media.type,
			filename,
			media.width,
			media.height,
		);
	});
}

let avatarFilename: string | null = null;
if (profile.avatarMediaUrl) {
	const candidate = `${account.accountId}-${basenameOf(profile.avatarMediaUrl)}`;
	const source = path.join(dataDir, "profile_media", candidate);
	try {
		copyFileSync(source, path.join(mediaOutDir, candidate));
		avatarFilename = candidate;
	} catch {
		console.warn(`Avatar not found at ${source}`);
	}
}
db.prepare(
	"INSERT INTO profile (username, display_name, avatar_filename) VALUES (?, ?, ?)",
).run(account.username, account.accountDisplayName, avatarFilename);
db.exec("COMMIT");
db.exec("VACUUM");
db.close();

const mediaBytes = readdirSync(mediaOutDir).reduce(
	(total, filename) => total + statSync(path.join(mediaOutDir, filename)).size,
	0,
);
const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

console.log(`Read ${allTweets.length} tweets from ${tweetFiles.join(", ")}`);
console.log(
	`Kept ${keptTweets.length}: ${kindCounts.tweet} tweets, ${kindCounts.retweet} retweets, ${kindCounts.reply} self-replies`,
);
if (orphanedReplies) {
	console.log(
		`${orphanedReplies} self-replies continue a tweet that isn't kept (a reply to someone else, or deleted)`,
	);
}
console.log(
	`Copied ${mediaCopied} media files and embedded ${linkedEmbedded} linked images and videos (${megabytes(mediaBytes)})`,
);
if (missingMedia.length) {
	console.log(`Missing media for: ${missingMedia.join(", ")}`);
}
console.log(`Wrote ${dbPath} (${megabytes(statSync(dbPath).size)})`);
