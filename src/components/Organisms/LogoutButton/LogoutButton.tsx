import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
	return (
		<form action="/api/auth/logout" method="POST">
			<button type="submit" className={styles.logout}>
				Logout
			</button>
		</form>
	);
}
