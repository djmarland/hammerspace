import Image from "next/image";
import type { PublicPostSummary } from "@/lib/posts";
import styles from "./CoverBackdrop.module.css";

interface CoverBackdropProps {
	coverAsset: NonNullable<PublicPostSummary["coverAsset"]>;
}

// Decorative hero behind the top of a post page. It fades into the page and,
// where scroll-driven animations are supported, drifts and dissolves as you
// scroll (pure CSS). The cover's alt text is exposed through the page's
// social metadata rather than read out here.
export default function CoverBackdrop({ coverAsset }: CoverBackdropProps) {
	return (
		<div className={styles.backdrop} aria-hidden="true">
			<div className={styles.image}>
				<Image
					src={coverAsset.url}
					alt=""
					fill
					preload
					sizes="(max-width: 56rem) 100vw, 66vw"
					className={styles.fit}
				/>
			</div>
		</div>
	);
}
