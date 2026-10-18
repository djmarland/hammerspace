import { Fragment } from "react";
import { cx } from "@/components/cx";
import { socials } from "@/lib/socials";
import styles from "./Socials.module.css";

export default function Socials() {
	return (
		<div className={cx(styles.socials, "piko-card", "piko-prose__block")}>
			<h3 className="piko-t-h5">Find me in these places:</h3>
			<dl className={styles.list}>
				{socials.map((social) => (
					<Fragment key={social.name}>
						<dt>{social.name}:</dt>
						<dd>
							<a href={social.href} target="_blank" rel="noopener noreferrer">
								{social.handle}
							</a>
						</dd>
					</Fragment>
				))}
			</dl>
		</div>
	);
}
