<script lang="ts">
	import styles from './LogoutButton.module.css';
</script>

<form action="/api/auth/logout" method="POST">
	<button type="submit" class={styles.logout}>
		Logout
	</button>
</form>
