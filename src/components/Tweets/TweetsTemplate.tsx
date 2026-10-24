import type { ReactNode } from "react";
import Link from "next/link";
import SidePageHeader from "@/components/Blog/SidePageHeader";
import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate";
import type { TweetProfile } from "@/lib/tweets";

interface TweetsTemplateProps {
	title: string;
	profile: TweetProfile | null;
	showIndexLink?: boolean;
	children: ReactNode;
}

export default function TweetsTemplate({
	title,
	profile,
	showIndexLink = true,
	children,
}: TweetsTemplateProps) {
	return (
		<SiteTemplate
			header={
				<SidePageHeader title={title}>
					{profile && (
						<p className="piko-t-meta">
							Archived from @{profile.username} on Twitter
						</p>
					)}
					{showIndexLink && <Link href="/tweets">All tweets</Link>}
				</SidePageHeader>
			}
		>
			{profile ? (
				children
			) : (
				<p data-state="info" className="piko-state__box">
					The tweet archive isn&rsquo;t available.
				</p>
			)}
		</SiteTemplate>
	);
}
