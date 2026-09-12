import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSessionUser } from "@/lib/admin-auth";
import LogoutButton from "@/components/Organisms/LogoutButton/LogoutButton";
import PasskeySetup from "@/components/PasskeySetup";
import { cx } from "@/components/cx";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Admin Dashboard",
};

interface AdminDashboardPageProps {
	searchParams: Promise<{ setupPasskey?: string }>;
}

export default async function AdminDashboardPage({
	searchParams,
}: AdminDashboardPageProps) {
	const session = await getAdminSessionUser();
	if (!session) {
		redirect("/admin/login");
	}

	const { setupPasskey: setupPasskeyParam } = await searchParams;
	const setupPasskey = setupPasskeyParam === "1";

	return (
		<div className="piko-page-container piko-vstack">
			<header className={cx(styles.header, "piko-vstack--small")}>
				<h1 className="piko-t-h1">Admin Dashboard</h1>
				<p>Welcome, {session.name || "Admin"}</p>
			</header>

			{setupPasskey && !session.hasPasskey && (
				<p data-state="info" className="piko-state__box">
					Please add your passkey now. Your login token will be invalidated
					after setup.
				</p>
			)}

			<PasskeySetup hasPasskey={session.hasPasskey} />

			<nav className={cx(styles.nav, "piko-hstack")}>
				<Link href="/admin/posts" className="piko-button">
					Manage Posts
				</Link>
				<Link href="/admin/posts/new" className="piko-button">
					New Post
				</Link>
				<LogoutButton />
			</nav>

			<section>
				<p>Manage drafts, publish posts, and edit existing content.</p>
			</section>
		</div>
	);
}
