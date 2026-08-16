import { writable } from "svelte/store";

export interface ReadingTimerState {
	isRunning: boolean;
	startedAt: number | null;
	elapsedMs: number;
}

export const readingTimerStore = writable<ReadingTimerState>({
	isRunning: false,
	startedAt: null,
	elapsedMs: 0,
});

export const readingSpeedStore = writable(200);

export function startReadingTimer() {
	readingTimerStore.set({
		isRunning: true,
		startedAt: Date.now(),
		elapsedMs: 0,
	});
}

export function stopReadingTimer() {
	readingTimerStore.update((state) => {
		if (!state.isRunning || state.startedAt === null) {
			return state;
		}
		return {
			isRunning: false,
			startedAt: null,
			elapsedMs: Date.now() - state.startedAt,
		};
	});
}

export function setReadingSpeed(wordsPerMinute: number) {
	readingSpeedStore.set(Math.max(1, Math.round(wordsPerMinute)));
}

export function calculateWordsPerMinute(wordCount: number, elapsedMs: number) {
	if (elapsedMs <= 0) {
		return 0;
	}
	const elapsedMinutes = elapsedMs / 60000;
	return Math.max(1, Math.round(wordCount / elapsedMinutes));
}
