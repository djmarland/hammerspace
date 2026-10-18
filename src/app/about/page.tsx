import type { Metadata } from "next";
import MarkdownContent from "@/components/Blog/MarkdownContent";
import SidePageHeader from "@/components/Blog/SidePageHeader";
import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate";
import Socials from "@/components/Molecules/Socials/Socials";
import { isPostPublic } from "@/lib/blog";
import { getPostBySlug } from "@/lib/posts";
import styles from "./page.module.css";

// Reads the DB on every request: a static prerender would query it at build
// time (where there is no real database) and bake that result in.
export const dynamic = "force-dynamic";

// Slug of the post whose content is rendered on the about page.
const ABOUT_POST_SLUG = "about-me-10-2026";

export const metadata: Metadata = {
	title: "About | Hammerspace",
};

export default async function AboutPage() {
	const post = await getPostBySlug(ABOUT_POST_SLUG);
	// Drafts and scheduled posts are reachable by direct URL, but shouldn't
	// leak onto the about page before they're published.
	const publicPost =
		post && post.status === "PUBLISHED" && isPostPublic(post.publishedAt)
			? post
			: null;

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
				{publicPost && (
					<>
						<Socials />
						<MarkdownContent content={publicPost.content} />
					</>
				)}
				<Socials />
			</div>
		</SiteTemplate>
	);
}
