import styles from "./page.module.css";

export const revalidate = 3600;

export default function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>THIS IS THE HOME PAGE</main>
		</div>
	);
}
