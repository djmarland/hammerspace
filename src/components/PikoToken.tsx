"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import styles from "./PikoToken.module.css";

interface PikoTokenProps {
	token: string;
}

const COPY_RESET_TIMEOUT_MS = 1500;

type CopyState = "idle" | "copied" | "error";

export default function PikoToken({ token }: PikoTokenProps) {
	const [copyState, setCopyState] = useState<CopyState>("idle");

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(token);
			setCopyState("copied");
		} catch {
			setCopyState("error");
		}

		setTimeout(() => {
			setCopyState("idle");
		}, COPY_RESET_TIMEOUT_MS);
	}

	function handleTokenClick() {
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) return;
		void handleCopy();
	}

	function handleTokenKeydown(event: KeyboardEvent<HTMLSpanElement>) {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		void handleCopy();
	}

	const copyLabel = copyState === "copied" ? "Copied" : "Copy token";

	return (
		<span
			className={styles.token}
			role="button"
			tabIndex={0}
			onClick={handleTokenClick}
			onKeyDown={handleTokenKeydown}
			aria-label={copyLabel}
		>
			<code>{token}</code>
			<span className={styles.icon} aria-hidden="true">
				{copyState === "copied" ? (
					<svg focusable="false" viewBox="0 0 24 24">
						<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
					</svg>
				) : (
					<svg focusable="false" viewBox="0 0 24 24">
						<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"></path>
					</svg>
				)}
			</span>
		</span>
	);
}
