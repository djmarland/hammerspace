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
			<img src={coverAsset.url} alt="" className={styles.image} />
		</div>
	);
}
