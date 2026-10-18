import type { ReactNode } from "react";
import styles from "./Pill.module.css";

interface PillProps {
	children: ReactNode;
}

/** Takes its border from the nearest `data-state` ancestor. */
export default function Pill({ children }: PillProps) {
	return <span className={styles.pill}>{children}</span>;
}
