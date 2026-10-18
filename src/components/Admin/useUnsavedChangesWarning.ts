"use client";

import { useEffect } from "react";

const MESSAGE = "You have unsaved changes. Are you sure you want to leave?";

/**
 * While `isDirty` is true, asks for confirmation before the user leaves the
 * page: clicking an in-app link prompts with `window.confirm`, and closing
 * the tab, reloading or following an external link triggers the browser's
 * own `beforeunload` prompt.
 *
 * The link check is a capture-phase listener on `document` so it runs before
 * `next/link` handles the click, and can cancel the client-side navigation.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
	useEffect(() => {
		if (!isDirty) return;

		function handleBeforeUnload(event: BeforeUnloadEvent) {
			event.preventDefault();
		}

		function handleClick(event: MouseEvent) {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const anchor = (event.target as Element | null)?.closest("a[href]");
			if (!(anchor instanceof HTMLAnchorElement)) return;
			if (anchor.target && anchor.target !== "_self") return;
			if (anchor.hasAttribute("download")) return;

			const url = new URL(anchor.href, window.location.href);
			// External links are covered by `beforeunload`.
			if (url.origin !== window.location.origin) return;
			// Same-page links (including hash links) don't lose any edits.
			if (
				url.pathname === window.location.pathname &&
				url.search === window.location.search
			) {
				return;
			}

			if (!window.confirm(MESSAGE)) {
				event.preventDefault();
				event.stopPropagation();
			}
		}

		window.addEventListener("beforeunload", handleBeforeUnload);
		document.addEventListener("click", handleClick, true);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			document.removeEventListener("click", handleClick, true);
		};
	}, [isDirty]);
}
