<script lang="ts">
    import {browser} from "$app/environment";
    import {onMount} from "svelte";
    import {readLocalStorage, writeLocalStorage} from "@/lib/local-storage";
    import {calculateWordsPerMinute, readingSpeedStore, readingTimerStore, setReadingSpeed,} from "@/lib/reading-timer";

    let {
		wordCount,
		defaultWordsPerMinute = 200,
		storageKey = ["reader", "blog", "reading-speed-wpm"],
		variant = "meta",
	}: {
		wordCount: number;
		defaultWordsPerMinute?: number;
		storageKey?: string | string[];
		variant?: "meta" | "footer";
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let stopDialog = $state<HTMLDialogElement | null>(null);
	let wordsPerMinute = $state(200);
	let hydrated = $state(false);
	let timerState = $state({
		isRunning: false,
		startedAt: null as number | null,
		elapsedMs: 0,
	});
	let liveElapsedMs = $state(0);
	let stopTimerWordsPerMinute = $state(200);

	function normalizeWordsPerMinute(value: number) {
		if (!Number.isFinite(value)) {
			return defaultWordsPerMinute;
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

	function readStoredWordsPerMinute() {
		if (!browser) {
			return defaultWordsPerMinute;
		}

		const storedValue = readLocalStorage<number>(storageKey);
		return normalizeWordsPerMinute(
			Number(storedValue ?? defaultWordsPerMinute),
		);
	}

	function persistWordsPerMinute() {
		if (!browser || !hydrated) {
			return;
		}
		writeLocalStorage(storageKey, wordsPerMinute, {
			savedAt: new Date().toISOString(),
		});
	}

	onMount(() => {
		const storedValue = readStoredWordsPerMinute();
		wordsPerMinute = storedValue;
		stopTimerWordsPerMinute = storedValue;
		setReadingSpeed(storedValue);
		hydrated = true;
		const unsubscribeTimer = readingTimerStore.subscribe((nextState) => {
			timerState = nextState;
		});
		const unsubscribeSpeed = readingSpeedStore.subscribe((nextValue) => {
			wordsPerMinute = nextValue;
			stopTimerWordsPerMinute = nextValue;
		});
		return () => {
			unsubscribeTimer();
			unsubscribeSpeed();
		};
	});

	$effect(() => {
		if (!hydrated || !browser) {
			return;
		}
		persistWordsPerMinute();
		setReadingSpeed(wordsPerMinute);
	});

	$effect(() => {
		if (timerState.isRunning && timerState.startedAt !== null) {
			const updateLiveElapsed = () => {
				liveElapsedMs = Date.now() - timerState.startedAt!;
			};
			updateLiveElapsed();
			const tick = window.setInterval(updateLiveElapsed, 250);
			return () => window.clearInterval(tick);
		}
		liveElapsedMs = timerState.elapsedMs;
		return;
	});

	const readingMinutes = $derived(
		Math.max(1, Math.ceil(wordCount / wordsPerMinute)),
	);
	const computedStopWordsPerMinute = $derived(
		calculateWordsPerMinute(wordCount, liveElapsedMs || timerState.elapsedMs),
	);

	function openDialog() {
		if (!browser || !dialog) {
			return;
		}
		dialog.showModal();
	}

	function closeDialog() {
		dialog?.close();
	}

	function updateWordsPerMinute(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const nextValue = Number.parseInt(input.value || "0", 10);
		const normalized = normalizeWordsPerMinute(nextValue);
		wordsPerMinute = normalized;
		stopTimerWordsPerMinute = normalized;
		setReadingSpeed(normalized);
	}

	function startTimer() {
		if (!browser) {
			return;
		}
		timerState = {
			isRunning: true,
			startedAt: Date.now(),
			elapsedMs: 0,
		};
		readingTimerStore.set(timerState);
		closeDialog();
	}

	function finishTimer() {
		if (!browser || timerState.startedAt === null) {
			return false;
		}
		const finalElapsed = Date.now() - timerState.startedAt;
		liveElapsedMs = finalElapsed;
		timerState = {
			isRunning: false,
			startedAt: null,
			elapsedMs: finalElapsed,
		};
		readingTimerStore.set(timerState);
		return true;
	}

	function stopTimer() {
		if (!browser) {
			return;
		}
		finishTimer();
		closeDialog();
		if (stopDialog) {
			stopTimerWordsPerMinute = computedStopWordsPerMinute;
			stopDialog.showModal();
		}
	}

	function saveStopTimer() {
		if (!browser) {
			return;
		}
		finishTimer();
		const normalized = normalizeWordsPerMinute(stopTimerWordsPerMinute);
		wordsPerMinute = normalized;
		stopTimerWordsPerMinute = normalized;
		setReadingSpeed(normalized);
		writeLocalStorage(storageKey, normalized, {
			savedAt: new Date().toISOString(),
		});
		stopDialog?.close();
	}

	function openFooterStopDialog() {
		if (!browser || !stopDialog) {
			return;
		}
		finishTimer();
		stopTimerWordsPerMinute = computedStopWordsPerMinute;
		stopDialog.showModal();
	}

	function closeStopDialog() {
		stopDialog?.close();
	}
</script>

{#if variant === "meta"}
	<span class="readingTime">
		<span>{wordCount.toLocaleString()} words</span>
		<span> (</span>
		<button type="button" class="readingTimeButton" onclick={openDialog}>
			{readingMinutes} min read
		</button>
		<span>)</span>
	</span>
	<dialog bind:this={dialog} class="dialog" aria-label="Adjust reading speed">
		<form method="dialog" class="dialogContent" onsubmit={closeDialog}>
			<p class="dialogTitle">Reading speed</p>
			<label for="reading-speed">Words read per minute</label>
			<input
				id="reading-speed"
				type="number"
				min="1"
				step="1"
				value={wordsPerMinute}
				oninput={updateWordsPerMinute}
			/>
			{#if timerState.isRunning}
				<p class="timerStatus">
					Timer running: {formatDuration(liveElapsedMs)}
				</p>
				<div class="dialogActions stackedActions">
					<button type="button" class="secondaryButton" onclick={stopTimer}
						>Stop Timer</button
					>
					<button type="submit">Close</button>
				</div>
			{:else}
				<p class="helperText">
					Don't know your reading speed?<br />
					Start a timer while reading this post. When finished, stop the timer to
					find your reading speed.
				</p>
				<div class="dialogActions stackedActions">
					<button type="button" class="primaryButton" onclick={startTimer}
						>Start Timer</button
					>
					<button type="submit">Close</button>
				</div>
			{/if}
		</form>
	</dialog>
{:else}
	{#if timerState.isRunning}
		<div class="footerAction">
			<button
				type="button"
				class="footerStopButton"
				onclick={openFooterStopDialog}
			>
				Stop Reading Timer
			</button>
		</div>
	{/if}

	<dialog bind:this={stopDialog} class="dialog" aria-label="Stop reading timer">
		<form method="dialog" class="dialogContent" onsubmit={closeStopDialog}>
			<p class="dialogTitle">Stop reading timer</p>
			<p class="timerStatus">Elapsed time: {formatDuration(liveElapsedMs)}</p>
			<label for="stop-reading-speed">Words per minute</label>
			<input
				id="stop-reading-speed"
				type="number"
				min="1"
				step="1"
				bind:value={stopTimerWordsPerMinute}
			/>
			<div class="dialogActions stackedActions">
				<button type="button" class="secondaryButton" onclick={closeStopDialog}
					>Cancel</button
				>
				<button type="button" class="primaryButton" onclick={saveStopTimer}
					>Save for next time</button
				>
			</div>
		</form>
	</dialog>
{/if}

<style>
	.readingTime {
		white-space: nowrap;
	}

	.readingTimeButton {
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
		color: inherit;
		font: inherit;
		text-decoration: underline;
		text-underline-offset: 0.15rem;
	}

	.readingTimeButton:hover,
	.readingTimeButton:focus-visible {
		opacity: 0.8;
	}

	.footerAction {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.footerStopButton,
	.primaryButton,
	.secondaryButton,
	.dialogActions button {
		padding: 0.65rem 1rem;
		border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
		border-radius: 0.5rem;
		font: inherit;
		cursor: pointer;
	}

	.footerStopButton,
	.primaryButton {
		background: color-mix(in srgb, currentColor 12%, transparent);
	}

	.secondaryButton {
		background: transparent;
	}

	.dialog {
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 1rem;
		padding: 1.25rem;
		background: var(--piko-color-background, #fff);
		color: inherit;
	}

	.dialog::backdrop {
		background: rgba(0, 0, 0, 0.35);
	}

	.dialogContent {
		display: grid;
		gap: 0.75rem;
		min-width: min(22rem, 80vw);
	}

	.dialogTitle {
		margin: 0;
		font-weight: 700;
	}

	.helperText,
	.timerStatus {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.dialogContent label {
		font-weight: 600;
	}

	.dialogContent input {
		width: 100%;
		padding: 0.65rem 0.75rem;
		border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
		border-radius: 0.5rem;
		font: inherit;
	}

	.dialogActions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.stackedActions {
		margin-top: 0.25rem;
	}
</style>
