"use client";

import type { ReactNode, Ref, SyntheticEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/components/cx";
import styles from "./Modal.module.css";
import { CloseIcon } from "@/components/Icons/CloseIcon.tsx";

interface ModalProps {
	title: string;
	children: ReactNode;
	actions?: ReactNode;
	className?: string;
	onCancel?: (event: SyntheticEvent<HTMLDialogElement>) => void;
	onClose?: () => void;
	ref?: Ref<HTMLDialogElement>;
}

/**
 * Portals the dialog to the end of `<body>` so it can't inherit styles from
 * wherever it's placed in the tree (a native <dialog>'s top-layer promotion
 * only affects paint order, not CSS inheritance).
 */
export default function Modal({
	title,
	children,
	actions,
	className,
	onCancel,
	onClose,
	ref,
}: ModalProps) {
	const titleId = useId();
	const [mounted, setMounted] = useState(false);
	const localRef = useRef<HTMLDialogElement | null>(null);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- one-off mount flag; document isn't available during SSR/first render
		setMounted(true);
	}, []);

	useEffect(() => {
		const dialog = localRef.current;
		if (!dialog) return;
		const handleClose = () => {
			onClose?.();
		};
		dialog.addEventListener("close", handleClose);
		return () => dialog.removeEventListener("close", handleClose);
	}, [onClose]);

	if (!mounted) {
		return null;
	}

	return createPortal(
		<dialog
			ref={(node) => {
				localRef.current = node;
				if (typeof ref === "function") {
					ref(node);
				} else if (ref) {
					ref.current = node;
				}
			}}
			className={cx(styles.dialog, className)}
			aria-labelledby={titleId}
			onCancel={onCancel}
		>
			<div className={styles.titleBar}>
				<h2 id={titleId} className={styles.title}>
					{title}
				</h2>
				<button
					type="button"
					className="piko-button--tertiary"
					onClick={() => localRef.current?.close()}
				>
					<CloseIcon />
				</button>
			</div>
			<div className={styles.body}>{children}</div>
			{actions && <div className={styles.actionsBar}>{actions}</div>}
		</dialog>,
		document.body,
	);
}
