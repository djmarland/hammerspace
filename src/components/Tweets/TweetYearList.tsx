import Link from "next/link";
import type { TweetYearCount } from "@/lib/tweets";
import styles from "./TweetYearList.module.css";

interface TweetYearListProps {
	years: TweetYearCount[];
}

export default function TweetYearList({ years }: TweetYearListProps) {
	return (
		<nav aria-label="Tweets by year">
			<ul className={styles.list}>
				{years.map(({ year, count }) => (
					<li key={year}>
						<Link href={`/tweets/${year}`} className={styles.link}>
							<span>{year}</span>
							<span className="piko-t-meta">
								{count.toLocaleString("en-GB")}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
