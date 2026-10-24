import Image from "next/image";
import Link from "next/link";
import type { Tweet, TweetProfile } from "@/lib/tweets";
import { cx } from "@/components/cx";
import TweetMedia from "./TweetMedia";
import TweetText, { newTab } from "./TweetText";
import styles from "./TweetCard.module.css";

interface TweetCardProps {
	tweet: Tweet;
	profile: TweetProfile;
	highlighted?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "Europe/London",
});

function plural(count: number, word: string) {
	return `${count.toLocaleString("en-GB")} ${word}${count === 1 ? "" : "s"}`;
}

export default function TweetCard({
	tweet,
	profile,
	highlighted = false,
}: TweetCardProps) {
	const counts = [
		tweet.favoriteCount > 0 && plural(tweet.favoriteCount, "like"),
		tweet.retweetCount > 0 && plural(tweet.retweetCount, "retweet"),
	].filter(Boolean);

	return (
		<article
			id={`tweet-${tweet.id}`}
			className={cx(
				"piko-card",
				styles.card,
				highlighted && styles.highlighted,
			)}
			aria-current={highlighted ? "page" : undefined}
		>
			{tweet.retweetedScreenName && (
				<p className="piko-t-meta">
					Retweeted{" "}
					<a href={`https://x.com/${tweet.retweetedScreenName}`} {...newTab}>
						@{tweet.retweetedScreenName}
					</a>
				</p>
			)}
			<header className={styles.author}>
				{profile.avatarUrl && (
					<Image
						src={profile.avatarUrl}
						alt=""
						width={48}
						height={48}
						className={styles.avatar}
					/>
				)}
				<div className={styles.byline}>
					<strong>{profile.displayName}</strong>
					<Link href={`/tweets/${tweet.id}`} className="piko-t-meta">
						<time dateTime={tweet.createdAt.toISOString()}>
							{dateFormatter.format(tweet.createdAt)}
						</time>
					</Link>
				</div>
			</header>
			<TweetText segments={tweet.segments} className={styles.text} />
			<TweetMedia media={tweet.media} />
			{counts.length > 0 && <p className="piko-t-meta">{counts.join(" · ")}</p>}
		</article>
	);
}
