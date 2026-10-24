import type { Metadata } from "next";
import TweetCard from "@/components/Tweets/TweetCard";
import TweetYearList from "@/components/Tweets/TweetYearList";
import TweetsTemplate from "@/components/Tweets/TweetsTemplate";
import { absoluteUrl } from "@/lib/site";
import { getLatestTweets, getTweetProfile, getTweetYears } from "@/lib/tweets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Tweets | Hammerspace",
	description: "An archive of my tweets from Twitter.",
	alternates: { canonical: absoluteUrl("/tweets") },
};

export default function TweetsPage() {
	const profile = getTweetProfile();
	const tweets = getLatestTweets(50) ?? [];
	const years = getTweetYears();

	return (
		<TweetsTemplate title="Tweets" profile={profile} showIndexLink={false}>
			{profile && (
				<>
					<section className="piko-vstack">
						<h2 className="piko-t-h3">By year</h2>
						<TweetYearList years={years} />
					</section>
					<section className="piko-vstack">
						<h2 className="piko-t-h3">Latest</h2>
						<ol className="piko-vstack">
							{tweets.map((tweet) => (
								<li key={tweet.id}>
									<TweetCard tweet={tweet} profile={profile} />
								</li>
							))}
						</ol>
					</section>
				</>
			)}
		</TweetsTemplate>
	);
}
