import type { ReactNode } from "react";
import { ViewTransition } from "react";
import Footer from "@/components/Organisms/Footer/Footer";
import styles from "./SiteTemplate.module.css";

interface SiteTemplateProps {
	children?: ReactNode;
	header?: ReactNode;
	// Decorative layer rendered behind the top of the content column.
	backdrop?: ReactNode;
}

export default function SiteTemplate({
	children,
	header,
	backdrop,
}: SiteTemplateProps) {
	return (
		<div className={styles.siteTemplate}>
			<header>
				<ViewTransition name="site-header-content">
					<div className={styles.headerContent}>{header}</div>
				</ViewTransition>
			</header>
			<ViewTransition name="site-content">
				<div className={styles.contentColumn}>
					{backdrop}
					<main className="piko-vstack--large">{children}</main>
					<Footer />
				</div>
			</ViewTransition>
		</div>
	);
}
