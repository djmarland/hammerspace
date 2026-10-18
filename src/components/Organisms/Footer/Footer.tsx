import Link from "next/link";
import { cx } from "@/components/cx";
import styles from "./Footer.module.css";
import { RssIcon } from "@/components/Icons/RssIcon.tsx";

export default function Footer() {
	return (
		<footer className={cx(styles.footer)}>
			<ul className={styles.matter}>
				<li>&copy; 2011 - {new Date().getFullYear()} hammerspace.co.uk</li>
				<li>
					<Link href="/feed.xml" className="piko-icon-link">
						<RssIcon />
						RSS
					</Link>
				</li>
				<li>
					<Link href="/about">About me</Link>
				</li>
				<li>
					<Link href="/piko">Piko design system</Link>
				</li>
				<li>
					<Link href="/admin">Admin</Link>
				</li>
			</ul>
			<p>
				<small>
					The opinions expressed on this site are my own and do not necessarily
					reflect the views of my employers, past or present.
					<br />
					Look Ma, no cookie banner. Anything stored in your browser is purely
					functional. No information is stored about you or shared with anyone.
					Your IP address may be used to estimate your location to see which
					regions generate the most traffic, but is not stored after that
					estimation. A cookie may be set to prevent double counting of page
					views, but is not used for tracking (which is acceptable without a
					cookie banner under the UK&apos;s{" "}
					<a
						href="https://www.legislation.gov.uk/ukpga/2025/18/section/112"
						target="_blank"
					>
						DUAA
					</a>{" "}
					and{" "}
					<a
						href="https://digital-strategy.ec.europa.eu/en/faqs/digital-package"
						target="_blank"
					>
						EU Digital Omnibus Package
					</a>
					). <br />
					This site is proxied via Cloudflare, which may collect some
					information about your visit. See{" "}
					<a href="https://www.cloudflare.com/privacypolicy/" target="_blank">
						Cloudflare&apos;s privacy policy
					</a>
					.
				</small>
			</p>
		</footer>
	);
}
