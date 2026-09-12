export default function LogoutButton() {
	return (
		<form action="/api/auth/logout" method="POST">
			<button type="submit" className="piko-link">
				Logout
			</button>
		</form>
	);
}
