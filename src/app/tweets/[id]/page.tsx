import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import TweetCard from "@/components/Tweets/TweetCard";
import TweetsTemplate from "@/components/Tweets/TweetsTemplate";
import { absoluteUrl } from "@/lib/site";
import { socialImageUrl } from "@/lib/social-image";
import {
	getTweetProfile,
	getTweetsForYear,
	getTweetThread,
	getTweetYears,
	tweetYearOf,
} from "@/lib/tweets";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const YEAR_PATTERN = /^\d{4}$/;
const TWEET_ID_PATTERN = /^\d{5,}$/;

const getCachedThread = cache(getTweetThread);

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
	timeZone: "Europe/London",
});

interface TweetPageProps {
	params: Promise<{ id: string }>;
}

function truncate(text: string, length: number) {
	return text.length > length
		? `${text.slice(0, length - 1).trimEnd()}…`
		: text;
}

export async function generateMetadata({
	params,
}: TweetPageProps): Promise<Metadata> {
	const { id } = await params;

	if (YEAR_PATTERN.test(id)) {
		return {
			title: `Tweets from ${id} | Hammerspace`,
			alternates: { canonical: absoluteUrl(`/tweets/${id}`) },
		};
	}

	const tweet = getCachedThread(id)?.find((item) => item.id === id);
	if (!tweet) {
		return { title: "Tweet not found | Hammerspace" };
	}

	const url = absoluteUrl(`/tweets/${tweet.id}`);
	const title = `Tweet from ${dateFormatter.format(tweet.createdAt)}`;
	const description = truncate(tweet.text, 200);
	const photo = tweet.media.find((media) => media.type === "photo");
	const images = photo
		? [{ url: socialImageUrl(photo.url), alt: "Photo attached to the tweet" }]
		: undefined;

	return {
		title: `${title} | Hammerspace`,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: "article",
			title,
			description,
			url,
			publishedTime: tweet.createdAt.toISOString(),
			images,
		},
		twitter: {
			card: images ? "summary_large_image" : "summary",
			title,
			description,
			images,
		},
	};
}

export default async function TweetOrYearPage({ params }: TweetPageProps) {
	const { id } = await params;

	if (YEAR_PATTERN.test(id)) {
		return <YearPage year={Number(id)} />;
	}
	if (TWEET_ID_PATTERN.test(id)) {
		return <TweetPage id={id} />;
	}
	notFound();
}

function YearPage({ year }: { year: number }) {
	const profile = getTweetProfile();
	const tweets = getTweetsForYear(year);
	if (profile && !tweets?.length) {
		notFound();
	}

	const years = getTweetYears().map((item) => item.year);
	const previous = years.findLast((item) => item < year);
	const next = years.find((item) => item > year);
	const yearNav = (
		<nav className={styles.yearNav} aria-label="Years">
			{previous ? (
				<Link href={`/tweets/${previous}`}>← {previous}</Link>
			) : (
				<span />
			)}
			{next ? <Link href={`/tweets/${next}`}>{next} →</Link> : <span />}
		</nav>
	);

	return (
		<TweetsTemplate title={`Tweets from ${year}`} profile={profile}>
			{profile && tweets && (
				<>
					{yearNav}
					<p>
						{tweets.length.toLocaleString("en-GB")}{" "}
						{tweets.length === 1 ? "tweet" : "tweets"}, oldest first.
					</p>
					<ol className="piko-vstack">
						{tweets.map((tweet) => (
							<li key={tweet.id}>
								<TweetCard tweet={tweet} profile={profile} />
							</li>
						))}
					</ol>
					{yearNav}
				</>
			)}
		</TweetsTemplate>
	);
}

function TweetPage({ id }: { id: string }) {
	const profile = getTweetProfile();
	const thread = getCachedThread(id);
	const tweet = thread?.find((item) => item.id === id);
	if (!profile || !thread || !tweet) {
		notFound();
	}

	const year = tweetYearOf(tweet.createdAt);
	const continuesConversation = thread[0].inReplyToId !== null;

	return (
		<TweetsTemplate
			title={thread.length > 1 ? "Thread" : "Tweet"}
			profile={profile}
		>
			{continuesConversation && (
				<p className="piko-t-meta">
					This continues a conversation that isn&rsquo;t archived here.
				</p>
			)}
			<ol className="piko-vstack">
				{thread.map((item) => (
					<li key={item.id}>
						<TweetCard
							tweet={item}
							profile={profile}
							highlighted={thread.length > 1 && item.id === id}
						/>
					</li>
				))}
			</ol>
			<p>
				<Link href={`/tweets/${year}`}>More tweets from {year}</Link>
			</p>
		</TweetsTemplate>
	);
}
