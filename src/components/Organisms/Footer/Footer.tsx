import styles from "./Footer.module.css";

export const Footer = () => (
	<footer className={styles.footer}>
		<div className="container">
			FOOTER / <a href="/piko">Piko design system</a> / <a href="/admin">Admin</a>
		</div>
	</footer>
);
