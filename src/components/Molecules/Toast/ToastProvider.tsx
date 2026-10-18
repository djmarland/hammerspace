"use client";

import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/Icons/CloseIcon.tsx";
import styles from "./Toast.module.css";

type ToastKind = "success" | "error";

interface ToastItem {
	id: number;
	kind: ToastKind;
	message: string;
}

interface ToastApi {
	/** Shows a message that dismisses itself after a few seconds. */
	success: (message: string) => void;
	/** Shows a message that stays until the user dismisses it. */
	error: (message: string) => void;
}

interface ToastHostApi {
	claim: (element: HTMLElement) => void;
	release: (element: HTMLElement) => void;
}

const SUCCESS_DURATION_MS = 4000;

const ToastContext = createContext<ToastApi | null>(null);
const ToastHostContext = createContext<ToastHostApi | null>(null);

export function useToast(): ToastApi {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

/**
 * Lets a modal `<dialog>` take over the toast viewport while it's open.
 * `showModal()` makes everything outside the dialog inert, so a viewport left
 * on `<body>` would show toasts the user couldn't dismiss. Returns null when
 * there's no provider, so a Modal still works outside the admin section.
 */
export function useToastHost() {
	return useContext(ToastHostContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const [hosts, setHosts] = useState<HTMLElement[]>([]);
	const [bodyElement, setBodyElement] = useState<HTMLElement | null>(null);
	const nextId = useRef(0);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- document isn't available during SSR/first render
		setBodyElement(document.body);
	}, []);

	const dismiss = useCallback((id: number) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

	const add = useCallback((kind: ToastKind, message: string) => {
		const id = nextId.current++;
		setToasts((current) => [...current, { id, kind, message }]);
	}, []);

	const api = useMemo<ToastApi>(
		() => ({
			success: (message) => add("success", message),
			error: (message) => add("error", message),
		}),
		[add],
	);

	const hostApi = useMemo<ToastHostApi>(
		() => ({
			claim: (element) =>
				setHosts((current) => [
					...current.filter((host) => host !== element),
					element,
				]),
			release: (element) =>
				setHosts((current) => current.filter((host) => host !== element)),
		}),
		[],
	);

	// The most recently opened modal wins; with none open, use <body>.
	const target = hosts.at(-1) ?? bodyElement;

	return (
		<ToastContext value={api}>
			<ToastHostContext value={hostApi}>{children}</ToastHostContext>
			{target &&
				createPortal(
					<div className={styles.viewport} aria-label="Notifications">
						{toasts.map((toast) => (
							<Toast key={toast.id} toast={toast} onDismiss={dismiss} />
						))}
					</div>,
					target,
				)}
		</ToastContext>
	);
}

function Toast({
	toast,
	onDismiss,
}: {
	toast: ToastItem;
	onDismiss: (id: number) => void;
}) {
	const { id, kind, message } = toast;

	useEffect(() => {
		if (kind !== "success") return;
		const timer = setTimeout(() => onDismiss(id), SUCCESS_DURATION_MS);
		return () => clearTimeout(timer);
	}, [id, kind, onDismiss]);

	return (
		<div
			className={`piko-state__box ${styles.toast}`}
			data-state={kind}
			role={kind === "error" ? "alert" : "status"}
		>
			<p className={styles.message}>{message}</p>
			{kind === "error" && (
				<button
					type="button"
					className="piko-button--tertiary"
					aria-label="Dismiss"
					onClick={() => onDismiss(id)}
				>
					<CloseIcon />
				</button>
			)}
		</div>
	);
}
