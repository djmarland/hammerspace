import { ReactNode } from "react";
import styles from "./layout.module.css";

export default function BlogLayout({ children }: { children: ReactNode }) {
	return (
		<section className={styles.layout}>
			<nav>CMS NAV</nav>
			<div>{children}</div>
		</section>
	);
}
