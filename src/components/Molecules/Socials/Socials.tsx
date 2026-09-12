import { cx } from "@/components/cx";
import styles from "./Socials.module.css";

export default function Socials() {
	return (
		<div className={cx(styles.socials, "piko-card", "piko-prose__block")}>
			<h3 className="piko-t-h5">Find me in these places:</h3>
			<dl className={styles.list}>
				<dt>Mastodon:</dt>
				<dd>
					<a
						href="https://mastodonapp.uk/@djmarland"
						target="_blank"
						rel="noopener noreferrer"
					>
						@djmarland@mastodonapp.uk
					</a>
				</dd>
				<dt>Bluesky:</dt>
				<dd>
					<a
						href="https://bsky.app/profile/djmarland.bsky.social"
						target="_blank"
						rel="noopener noreferrer"
					>
						@djmarland.bsky.social
					</a>
				</dd>
			</dl>
		</div>
	);
}
