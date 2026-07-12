import Link from "next/link";
import { redirect } from "next/navigation";
import PasskeySetup from "@/components/PasskeySetup";
import LogoutButton from "@/components/Organisms/LogoutButton/LogoutButton.tsx";
import { getAdminSessionUser } from "@/lib/admin-auth";
import styles from "./page.module.css";

interface AdminDashboardProps {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminDashboard({
	searchParams,
}: AdminDashboardProps) {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const resolvedSearchParams = searchParams ? await searchParams : {};
	const shouldHighlightSetup = resolvedSearchParams.setupPasskey === "1";

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<h1>Admin Dashboard</h1>
				<p>Welcome, {session.name || "Admin"}</p>
			</header>

			{shouldHighlightSetup && !session.hasPasskey && (
				<p>
					Please add your passkey now. Your login token will be invalidated
					after setup.
				</p>
			)}

			<PasskeySetup hasPasskey={session.hasPasskey} />

			<nav className={styles.nav}>
				<Link href="/admin/create" className={styles.button}>
					Create Post
				</Link>
				<LogoutButton />
			</nav>

			<section className={styles.content}>
				<p>Blog management coming soon...</p>
			</section>
		</div>
	);
}
