import type { Metadata } from "next";
import SidePageHeader from "@/components/Blog/SidePageHeader";
import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate";
import Socials from "@/components/Molecules/Socials/Socials";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "About | Hammerspace",
};

export default function AboutPage() {
	return (
		<SiteTemplate
			header={
				<SidePageHeader title="About">
					<img
						className={styles.profile}
						src="/profile.jpeg"
						alt="David, wearing sunglasses, a hat and white shirt"
					/>
				</SidePageHeader>
			}
		>
			<div className="piko-prose">
				<Socials />
				<p>
					Hello, I am David Marland. I have been developing websites since 1999.
				</p>
			</div>
		</SiteTemplate>
	);
}
