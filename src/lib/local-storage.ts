function flattenKeySegments(parts: string | string[]) {
	const segments = Array.isArray(parts) ? parts : [parts];
	return segments
		.flatMap((segment) => String(segment).split(":"))
		.map((segment) => segment.trim())
		.filter((segment) => segment.length > 0 && segment !== "hammerspace");
}

export function buildLocalStorageKey(...parts: Array<string | string[]>) {
	const segments = [
		"hammerspace",
		...parts.flatMap((part) => flattenKeySegments(part)),
	];
	return segments.join(":");
}

export type LocalStorageEntry<T> = {
	value: T;
	meta?: Record<string, unknown>;
};

export function readLocalStorageEntry<T>(key: string | string[]) {
	if (typeof window === "undefined") {
		return undefined as LocalStorageEntry<T> | undefined;
	}

	const localStorageKey = buildLocalStorageKey(key);
	const rawValue = window.localStorage.getItem(localStorageKey);
	if (rawValue === null) {
		return undefined as LocalStorageEntry<T> | undefined;
	}

	try {
		const parsed = JSON.parse(rawValue) as unknown;
		if (
			parsed !== null &&
			typeof parsed === "object" &&
			"value" in (parsed as Record<string, unknown>)
		) {
			return parsed as LocalStorageEntry<T>;
		}
		return {
			value: parsed as T,
			meta: undefined,
		} satisfies LocalStorageEntry<T>;
	} catch {
		return undefined as LocalStorageEntry<T> | undefined;
	}
}

export function readLocalStorage<T>(key: string | string[]) {
	return readLocalStorageEntry<T>(key)?.value;
}

export function writeLocalStorage<T>(
	key: string | string[],
	value: T,
	meta?: Record<string, unknown>,
) {
	if (typeof window === "undefined") {
		return undefined;
	}

	const localStorageKey = buildLocalStorageKey(key);
	const entry: LocalStorageEntry<T> = {
		value,
		meta: {
			savedAt: new Date().toISOString(),
			...meta,
		},
	};
	window.localStorage.setItem(localStorageKey, JSON.stringify(entry));
	return value;
}

export function removeLocalStorage(key: string | string[]) {
	if (typeof window === "undefined") {
		return;
	}
	const localStorageKey = buildLocalStorageKey(key);
	window.localStorage.removeItem(localStorageKey);
}
