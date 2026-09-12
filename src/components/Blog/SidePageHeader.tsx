import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Atoms/Logo/Logo";
import styles from "./SidePageHeader.module.css";

interface SidePageHeaderProps {
	title: string;
	children?: ReactNode;
}

export default function SidePageHeader({
	title,
	children,
}: SidePageHeaderProps) {
	return (
		<header className={styles.header}>
			<div className={styles.logo}>
				<Link href="/">
					<Logo />
				</Link>
			</div>
			<h1 className="piko-t-h1">{title}</h1>
			{children}
		</header>
	);
}
