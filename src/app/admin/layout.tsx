import type { ReactNode } from "react";
import Masthead from "@/components/Organisms/Masthead/Masthead";
import styles from "./layout.module.css";

/**
 * Shared shell for every /admin/** route. Deliberately does NOT perform the
 * unauthenticated-redirect here - Next.js layouts are not guaranteed to
 * re-run their own redirect on every nested navigation the way a page's
 * render does, so each page under /admin performs its own
 * `getAdminSessionUser()` check and redirect. `src/proxy.ts` also redirects
 * unauthenticated `/admin/:path*` requests centrally, but per Next.js's
 * guidance that's a defense-in-depth measure, not a replacement for the
 * per-page check.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className={styles.adminShell}>
			<Masthead />
			{children}
		</div>
	);
}
