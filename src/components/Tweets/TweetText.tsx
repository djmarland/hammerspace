import type { TweetSegment } from "@/lib/tweets";

export const newTab = { target: "_blank", rel: "noopener noreferrer" };

interface TweetTextProps {
	segments: TweetSegment[];
	className?: string;
}

export default function TweetText({ segments, className }: TweetTextProps) {
	if (segments.length === 0) {
		return null;
	}

	return (
		<p className={className}>
			{segments.map((segment, index) => {
				switch (segment.type) {
					case "text":
						return segment.value;
					case "url":
						return (
							<a key={index} href={segment.href} {...newTab}>
								{segment.display}
							</a>
						);
					case "mention":
						return (
							<a
								key={index}
								href={`https://x.com/${segment.screenName}`}
								{...newTab}
							>
								@{segment.screenName}
							</a>
						);
					case "hashtag":
						return (
							<a
								key={index}
								href={`https://x.com/hashtag/${encodeURIComponent(segment.tag)}`}
								{...newTab}
							>
								#{segment.tag}
							</a>
						);
				}
			})}
		</p>
	);
}
