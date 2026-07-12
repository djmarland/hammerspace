import styles from "./page.module.css";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default function Home() {
	return (
		<main className={styles.container}>
			<header className={styles.header}>
				<h1>Hammerspace Blog</h1>
				<p>Welcome to the blog</p>
			</header>

			<nav className={styles.nav}>
				<a href="/">Home</a>
				<a href="/admin">Admin</a>
			</nav>

			<section className={styles.content}>
				<p>Loading posts...</p>
			</section>
		</main>
	);
}
