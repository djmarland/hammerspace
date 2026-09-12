import Link from "next/link";
import { cx } from "@/components/cx";
import Logo from "@/components/Atoms/Logo/Logo";
import LogoutButton from "@/components/Organisms/LogoutButton/LogoutButton";
import styles from "./Masthead.module.css";

export default function Masthead({
	isAuthenticated,
}: {
	isAuthenticated: boolean;
}) {
	return (
		<header className={styles.masthead}>
			<div className={cx("piko-page-container", styles.masthead__container)}>
				<div>
					<Link href="/">
						<Logo />
					</Link>
				</div>
				{isAuthenticated && (
					<nav>
						<ul className={styles.masthead__nav}>
							<li>
								<Link href="/admin/posts/new">New Post</Link>
							</li>
							<li>
								<Link href="/admin/posts">Posts</Link>
							</li>
							<li>
								<Link href="/admin/tags">Tags</Link>
							</li>
							<li>
								<LogoutButton />
							</li>
						</ul>
					</nav>
				)}
			</div>
		</header>
	);
}
