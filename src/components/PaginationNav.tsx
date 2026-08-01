import Link from "next/link";
import styles from "./PaginationNav.module.css";

interface PaginationNavProps {
	page: number;
	totalPages: number;
	buildHref: (page: number) => string;
}

function buildPageList(page: number, totalPages: number) {
	const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
	return [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
}

export default function PaginationNav({ page, totalPages, buildHref }: PaginationNavProps) {
	if (totalPages <= 1) {
		return null;
	}

	const pages = buildPageList(page, totalPages);

	return (
		<nav className={styles.nav} aria-label="Pagination">
			<Link
				href={buildHref(Math.max(1, page - 1))}
				className={styles.link}
				aria-disabled={page === 1}
				tabIndex={page === 1 ? -1 : undefined}
			>
				← Previous
			</Link>
			<div className={styles.pages}>
				{pages.map((value, index) => {
					const previousValue = pages[index - 1];
					const showGap = previousValue && value - previousValue > 1;
					return (
						<span key={value} className={styles.pageGroup}>
							{showGap && <span className={styles.gap}>…</span>}
							<Link
								href={buildHref(value)}
								className={value === page ? styles.currentPage : styles.link}
								aria-current={value === page ? "page" : undefined}
							>
								{value}
							</Link>
						</span>
					);
				})}
			</div>
			<Link
				href={buildHref(Math.min(totalPages, page + 1))}
				className={styles.link}
				aria-disabled={page === totalPages}
				tabIndex={page === totalPages ? -1 : undefined}
			>
				Next →
			</Link>
		</nav>
	);
}
