import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionUser } from "@/lib/admin-auth";
import AdminPostCard from "@/components/Admin/AdminPostCard";
import PasskeySetup from "@/components/PasskeySetup";
import { getAdminDashboardPosts } from "@/lib/posts";
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
	const { inProgress, recentlyPublished } = await getAdminDashboardPosts();

	return (
		<div className="piko-page-container piko-vstack">
			{setupPasskey && !session.hasPasskey && (
				<p data-state="info" className="piko-state__box">
					Please add your passkey now. Your login token will be invalidated
					after setup.
				</p>
			)}

			<PasskeySetup hasPasskey={session.hasPasskey} />

			<section className="piko-vstack">
				<h2 className="piko-t-h2">In progress</h2>
				{inProgress.length === 0 ? (
					<p>Nothing in progress.</p>
				) : (
					<div className={styles.cards}>
						{inProgress.map((post) => (
							<AdminPostCard key={post.id} post={post} />
						))}
					</div>
				)}
			</section>

			<section className="piko-vstack">
				<h2 className="piko-t-h2">Recently Published</h2>
				{recentlyPublished.length === 0 ? (
					<p>No posts published yet.</p>
				) : (
					<div className={styles.cards}>
						{recentlyPublished.map((post) => (
							<AdminPostCard key={post.id} post={post} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
