"use client";

import { useId, useState } from "react";
import styles from "./PikoToken.module.css";

interface PikoTokenProps {
	token: string;
}

const COPY_RESET_TIMEOUT_MS = 1500;

export default function PikoToken({ token }: PikoTokenProps) {
	const statusId = useId();
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(token);
			setCopyState("copied");
		} catch {
			setCopyState("error");
		}

		window.setTimeout(() => {
			setCopyState("idle");
		}, COPY_RESET_TIMEOUT_MS);
	};

	const copyLabel = copyState === "copied" ? "Copied" : "Copy";
	const statusText =
		copyState === "copied"
			? `Copied ${token} to clipboard.`
			: copyState === "error"
				? "Copy failed."
				: "";

	return (
		<span className={styles.token}>
			<code>{token}</code>
			<button
				type="button"
				className={styles.copyButton}
				onClick={handleCopy}
				aria-label={`Copy ${token} to clipboard`}
				aria-describedby={statusId}
			>
				{copyLabel}
			</button>
			<span
				id={statusId}
				className={styles.visuallyHidden}
				role="status"
				aria-live="polite"
			>
				{statusText}
			</span>
		</span>
	);
}
