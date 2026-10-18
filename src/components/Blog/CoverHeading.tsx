import Image from "next/image";
import type { ElementType, ReactNode } from "react";
import { cx } from "@/components/cx";
import type { PublicPostSummary } from "@/lib/posts";
import styles from "./CoverHeading.module.css";

interface CoverHeadingProps {
	coverAsset: PublicPostSummary["coverAsset"];
	// Render the same cut-corner block even without a cover (the element's own
	// background shows instead of an image).
	solid?: boolean;
	as?: ElementType;
	className?: string;
	children: ReactNode;
}

// A post's heading block in a listing. With a cover, the cover sits behind
// the text with a corner cut off (top-right unless `--cover-clip` says
// otherwise), fading out towards the text, and the text gets a stroke in the
// surrounding background colour (set `--cover-stroke` on `className` if that
// isn't the page background). `--cover-cut` is the size of the cut.
export default function CoverHeading({
	coverAsset,
	solid,
	as: Tag = "header",
	className,
	children,
}: CoverHeadingProps) {
	return (
		<Tag
			className={cx(
				className,
				(coverAsset || solid) && styles.block,
				coverAsset && styles.hasCover,
			)}
		>
			{coverAsset && (
				<Image
					src={coverAsset.url}
					alt=""
					aria-hidden="true"
					fill
					sizes="(max-width: 56rem) 100vw, min(66vw, 720px)"
					className={styles.cover}
				/>
			)}
			{children}
		</Tag>
	);
}
