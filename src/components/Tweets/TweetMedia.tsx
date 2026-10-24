import Image from "next/image";
import type { TweetMedia as TweetMediaItem } from "@/lib/tweets";
import { cx } from "@/components/cx";
import styles from "./TweetMedia.module.css";

interface TweetMediaProps {
	media: TweetMediaItem[];
}

export default function TweetMedia({ media }: TweetMediaProps) {
	if (media.length === 0) {
		return null;
	}

	return (
		<div className={cx(styles.grid, media.length > 1 && styles.multiple)}>
			{media.map((item) => {
				switch (item.type) {
					case "photo":
						return (
							<a key={item.url} href={item.url} className={styles.item}>
								<Image
									src={item.url}
									alt="Photo attached to the tweet"
									width={item.width}
									height={item.height}
									sizes="(max-width: 56rem) 100vw, 60vw"
								/>
							</a>
						);
					case "video":
						return (
							<video
								key={item.url}
								className={styles.item}
								src={item.url}
								width={item.width}
								height={item.height}
								controls
								preload="metadata"
							/>
						);
					case "animated_gif":
						return (
							<video
								key={item.url}
								className={styles.item}
								src={item.url}
								width={item.width}
								height={item.height}
								autoPlay
								loop
								muted
								playsInline
							/>
						);
				}
			})}
		</div>
	);
}
