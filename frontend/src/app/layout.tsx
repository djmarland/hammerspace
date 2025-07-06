import type { Metadata } from "next";
import "./global.css";
import { ReactNode } from "react";
import styles from "./layout.module.css";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Hammerspace",
	description: "Personal Blog of David Marland",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
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
				{children}
			</body>
		</html>
	);
}
