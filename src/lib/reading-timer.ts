/**
 * Reading timer/speed state shared between the "meta" and "footer" variants
 * of the ReadingTime component on a post page. Deliberately framework-free
 * (no React import) - it's a plain pub-sub store, consumed from React via
 * `useSyncExternalStore`.
 */

export interface ReadingTimerState {
	isRunning: boolean;
	startedAt: number | null;
	elapsedMs: number;
}

type Listener = () => void;

interface Store<T> {
	getSnapshot: () => T;
	subscribe: (listener: Listener) => () => void;
	set: (nextValue: T) => void;
	update: (updater: (current: T) => T) => void;
}

function createStore<T>(initialValue: T): Store<T> {
	let value = initialValue;
	const listeners = new Set<Listener>();

	function getSnapshot() {
		return value;
	}

	function subscribe(listener: Listener) {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}

	function set(nextValue: T) {
		value = nextValue;
		listeners.forEach((listener) => listener());
	}

	function update(updater: (current: T) => T) {
		set(updater(value));
	}

	return { getSnapshot, subscribe, set, update };
}

export const readingTimerStore = createStore<ReadingTimerState>({
	isRunning: false,
	startedAt: null,
	elapsedMs: 0,
});

export const readingSpeedStore = createStore(200);

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
