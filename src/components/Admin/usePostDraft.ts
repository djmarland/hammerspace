"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { SelectedAsset } from "@/components/Admin/AssetLibrary/AssetLibraryModal";

export interface PostDraftFields {
	title: string;
	slug: string;
	content: string;
	coverAsset: SelectedAsset | null;
}

export interface PostDraft extends PostDraftFields {
	savedAt: number;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
	listeners.add(listener);
	// Other tabs editing the same post.
	window.addEventListener("storage", listener);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", listener);
	};
}

function notify() {
	listeners.forEach((listener) => listener());
}

function read(key: string) {
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
}

function parse(raw: string | null): PostDraft | null {
	if (!raw) return null;
	try {
		const value = JSON.parse(raw);
		if (
			typeof value?.title === "string" &&
			typeof value.slug === "string" &&
			typeof value.content === "string" &&
			typeof value.savedAt === "number"
		) {
			return {
				title: value.title,
				slug: value.slug,
				content: value.content,
				coverAsset: value.coverAsset ?? null,
				savedAt: value.savedAt,
			};
		}
	} catch {
		// Corrupt entry; treat as no draft.
	}
	return null;
}

/**
 * Work-in-progress persistence for the post editor, backed by localStorage
 * under `key`. `stored` is whatever draft was in storage (null on the
 * server and on first client render), so callers can offer to restore it.
 * Storage can be unavailable or full, in which case saving is a no-op.
 */
export function usePostDraft(key: string) {
	const raw = useSyncExternalStore(
		subscribe,
		() => read(key),
		() => null,
	);
	const stored = useMemo(() => parse(raw), [raw]);

	const save = useCallback(
		(fields: PostDraftFields) => {
			try {
				const draft: PostDraft = { ...fields, savedAt: Date.now() };
				window.localStorage.setItem(key, JSON.stringify(draft));
			} catch {
				return;
			}
			notify();
		},
		[key],
	);

	const clear = useCallback(() => {
		try {
			window.localStorage.removeItem(key);
		} catch {
			return;
		}
		notify();
	}, [key]);

	return { stored, save, clear };
}
