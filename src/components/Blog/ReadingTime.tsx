"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import type { ChangeEvent, FormEvent } from "react";
import { cx } from "@/components/cx";
import { readLocalStorage, writeLocalStorage } from "@/lib/local-storage";
import {
	calculateWordsPerMinute,
	readingSpeedStore,
	readingTimerStore,
	setReadingSpeed,
	stopReadingTimer,
	startReadingTimer,
} from "@/lib/reading-timer";
import styles from "./ReadingTime.module.css";

interface ReadingTimeProps {
	wordCount: number;
	defaultWordsPerMinute?: number;
	storageKey?: string | string[];
	variant?: "meta" | "footer";
}

function normalizeWordsPerMinute(value: number, fallback: number) {
	if (!Number.isFinite(value)) {
		return fallback;
	}
	return Math.max(1, Math.round(value));
}

function formatDuration(ms: number) {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return [hours, minutes, seconds]
		.map((value) => String(value).padStart(2, "0"))
		.join(":");
}

export default function ReadingTime({
	wordCount,
	defaultWordsPerMinute = 200,
	storageKey = ["reader", "blog", "reading-speed-wpm"],
	variant = "meta",
}: ReadingTimeProps) {
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const stopDialogRef = useRef<HTMLDialogElement | null>(null);

	const [hydrated, setHydrated] = useState(false);
	// Only ever written from the ticking interval's callback below - a
	// legitimate "subscribe to an external clock" effect, not a case of
	// mirroring other state.
	const [liveTickMs, setLiveTickMs] = useState(0);

	const timerState = useSyncExternalStore(
		readingTimerStore.subscribe,
		readingTimerStore.getSnapshot,
		readingTimerStore.getSnapshot,
	);
	const wordsPerMinute = useSyncExternalStore(
		readingSpeedStore.subscribe,
		readingSpeedStore.getSnapshot,
		readingSpeedStore.getSnapshot,
	);

	const [stopTimerWordsPerMinute, setStopTimerWordsPerMinute] =
		useState(wordsPerMinute);
	// "Adjust state when a prop/store value changes" via a render-time check
	// instead of an Effect (see https://react.dev/learn/you-might-not-need-an-effect) -
	// keeps the stop-dialog's editable value following the shared reading
	// speed whenever it changes elsewhere (e.g. the other variant's dialog),
	// without an Effect calling setState.
	const [prevWordsPerMinute, setPrevWordsPerMinute] = useState(wordsPerMinute);
	if (wordsPerMinute !== prevWordsPerMinute) {
		setPrevWordsPerMinute(wordsPerMinute);
		setStopTimerWordsPerMinute(wordsPerMinute);
	}

	const storageKeyDep = Array.isArray(storageKey)
		? storageKey.join(":")
		: storageKey;

	// Runs once on mount to hydrate the shared reading-speed store from
	// localStorage (whichever ReadingTime instance mounts first "wins", but
	// both compute the same value). This genuinely can't be computed during
	// render - localStorage isn't available on the server, and only exists
	// once mounted in the browser.
	useEffect(() => {
		const storedValue = readLocalStorage<number>(storageKey);
		const normalized = normalizeWordsPerMinute(
			Number(storedValue ?? defaultWordsPerMinute),
			defaultWordsPerMinute,
		);
		setReadingSpeed(normalized);
		// eslint-disable-next-line react-hooks/set-state-in-effect -- one-off mount hydration from localStorage, which doesn't exist on the server/during render
		setHydrated(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-only
	}, []);

	// Persist to localStorage whenever the shared reading speed changes,
	// once hydrated (avoids clobbering storage with the default on mount).
	// Only calls the external writeLocalStorage, not a React state setter.
	useEffect(() => {
		if (!hydrated) {
			return;
		}
		writeLocalStorage(storageKey, wordsPerMinute, {
			savedAt: new Date().toISOString(),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wordsPerMinute, hydrated, storageKeyDep]);

	// Tick a live elapsed-time value while the shared timer is running. Only
	// the callback (fired immediately, then every 250ms) calls setState -
	// the classic "subscribe to an external clock" Effect.
	useEffect(() => {
		if (!timerState.isRunning || timerState.startedAt === null) {
			return undefined;
		}
		const startedAt = timerState.startedAt;
		const updateLiveElapsed = () => {
			setLiveTickMs(Date.now() - startedAt);
		};
		updateLiveElapsed();
		const tick = window.setInterval(updateLiveElapsed, 250);
		return () => window.clearInterval(tick);
	}, [timerState.isRunning, timerState.startedAt]);

	const liveElapsedMs = timerState.isRunning
		? liveTickMs
		: timerState.elapsedMs;

	const readingMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

	const openDialog = useCallback(() => {
		dialogRef.current?.showModal();
	}, []);

	const closeDialog = useCallback((event?: FormEvent) => {
		event?.preventDefault();
		dialogRef.current?.close();
	}, []);

	function updateWordsPerMinute(event: ChangeEvent<HTMLInputElement>) {
		const nextValue = Number.parseInt(event.currentTarget.value || "0", 10);
		const normalized = normalizeWordsPerMinute(
			nextValue,
			defaultWordsPerMinute,
		);
		setReadingSpeed(normalized);
	}

	// Returns the just-finished elapsed time (ms), or null if no timer was
	// running. Stopping the shared timer store triggers a re-render (via
	// useSyncExternalStore) that naturally picks up the new, non-running
	// `timerState.elapsedMs` - no local state to update here.
	function finishTimer(): number | null {
		const current = readingTimerStore.getSnapshot();
		if (!current.isRunning || current.startedAt === null) {
			return null;
		}
		stopReadingTimer();
		return readingTimerStore.getSnapshot().elapsedMs;
	}

	function startTimer() {
		startReadingTimer();
		closeDialog();
	}

	function stopTimer() {
		const finalElapsed = finishTimer();
		closeDialog();
		if (stopDialogRef.current) {
			const elapsed = finalElapsed ?? timerState.elapsedMs;
			setStopTimerWordsPerMinute(calculateWordsPerMinute(wordCount, elapsed));
			stopDialogRef.current.showModal();
		}
	}

	function saveStopTimer() {
		finishTimer();
		const normalized = normalizeWordsPerMinute(
			stopTimerWordsPerMinute,
			defaultWordsPerMinute,
		);
		setStopTimerWordsPerMinute(normalized);
		setReadingSpeed(normalized);
		writeLocalStorage(storageKey, normalized, {
			savedAt: new Date().toISOString(),
		});
		stopDialogRef.current?.close();
	}

	function openFooterStopDialog() {
		const finalElapsed = finishTimer();
		const elapsed = finalElapsed ?? timerState.elapsedMs;
		setStopTimerWordsPerMinute(calculateWordsPerMinute(wordCount, elapsed));
		stopDialogRef.current?.showModal();
	}

	function closeStopDialog(event?: FormEvent) {
		event?.preventDefault();
		stopDialogRef.current?.close();
	}

	if (variant === "meta") {
		return (
			<>
				<span className={styles.readingTime}>
					<span>{wordCount.toLocaleString()} words</span>
					<span> (</span>
					<button
						type="button"
						className={styles.readingTimeButton}
						onClick={openDialog}
					>
						{readingMinutes} min read
					</button>
					<span>)</span>
				</span>
				<dialog
					ref={dialogRef}
					className={styles.dialog}
					aria-label="Adjust reading speed"
				>
					<form
						method="dialog"
						className={styles.dialogContent}
						onSubmit={closeDialog}
					>
						<p className={styles.dialogTitle}>Reading speed</p>
						<label htmlFor="reading-speed">Words read per minute</label>
						<input
							id="reading-speed"
							type="number"
							min={1}
							step={1}
							value={wordsPerMinute}
							onChange={updateWordsPerMinute}
						/>
						{timerState.isRunning ? (
							<>
								<p className={styles.timerStatus}>
									Timer running: {formatDuration(liveElapsedMs)}
								</p>
								<div
									className={cx(styles.dialogActions, styles.stackedActions)}
								>
									<button
										type="button"
										className="piko-button--primary"
										onClick={stopTimer}
									>
										Stop Timer
									</button>
									<button type="submit">Close</button>
								</div>
							</>
						) : (
							<>
								<p className={styles.helperText}>
									Don&apos;t know your reading speed?
									<br />
									Start a timer while reading this post. When finished, stop the
									timer to find your reading speed.
								</p>
								<div
									className={cx(styles.dialogActions, styles.stackedActions)}
								>
									<button
										type="button"
										className="piko-button--primary"
										onClick={startTimer}
									>
										Start Timer
									</button>
									<button type="submit">Close</button>
								</div>
							</>
						)}
					</form>
				</dialog>
			</>
		);
	}

	return (
		<>
			{timerState.isRunning && (
				<div className={styles.footerAction}>
					<button
						type="button"
						className={styles.footerStopButton}
						onClick={openFooterStopDialog}
					>
						Stop Reading Timer
					</button>
				</div>
			)}

			<dialog ref={stopDialogRef} aria-label="Stop reading timer">
				<form
					method="dialog"
					className={styles.dialogContent}
					onSubmit={closeStopDialog}
				>
					<p className={styles.dialogTitle}>Stop reading timer</p>
					<p className={styles.timerStatus}>
						Elapsed time: {formatDuration(liveElapsedMs)}
					</p>
					<label htmlFor="stop-reading-speed">Words per minute</label>
					<input
						id="stop-reading-speed"
						type="number"
						min={1}
						step={1}
						value={stopTimerWordsPerMinute}
						onChange={(event) =>
							setStopTimerWordsPerMinute(
								Number.parseInt(event.currentTarget.value || "0", 10),
							)
						}
					/>
					<div className={cx(styles.dialogActions, styles.stackedActions)}>
						<button type="button" onClick={closeStopDialog}>
							Cancel
						</button>
						<button
							type="button"
							className="piko-button--primary"
							onClick={saveStopTimer}
						>
							Save for next time
						</button>
					</div>
				</form>
			</dialog>
		</>
	);
}
