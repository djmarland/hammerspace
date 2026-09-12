import type { ReactNode } from "react";
import { ViewTransition } from "react";
import Footer from "@/components/Organisms/Footer/Footer";
import styles from "./SiteTemplate.module.css";

interface SiteTemplateProps {
	children?: ReactNode;
	header?: ReactNode;
}

export default function SiteTemplate({ children, header }: SiteTemplateProps) {
	return (
		<div className={styles.siteTemplate}>
			<header>
				<ViewTransition name="site-header-content">
					<div className={styles.headerContent}>{header}</div>
				</ViewTransition>
			</header>
			<ViewTransition name="site-content">
				<div className={styles.contentColumn}>
					<main className="piko-vstack--large">{children}</main>
					<Footer />
				</div>
			</ViewTransition>
		</div>
	);
}
