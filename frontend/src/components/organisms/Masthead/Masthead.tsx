import styles from "./Masthead.module.css";
import Link from "next/link";
import { FC } from "react";

export const Masthead: FC = () => (
	<header className={styles.header}>
		<nav>
			<ul>
				<li>
					<Link href="/posts">Posts</Link>
				</li>
				<li>
					<Link href="/cms">CMS</Link>
				</li>
			</ul>
		</nav>
	</header>
);
