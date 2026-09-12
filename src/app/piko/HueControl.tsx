"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// A small client-only demo widget that lets a visitor preview other hues
// against the live page: one effect hydrates the initial value from the
// server-rendered CSS custom property on mount, the other writes changes
// back to the document element whenever the slider moves.
export default function HueControl() {
	const [dynamicHue, setDynamicHue] = useState(0);
	const hasUserChangedHue = useRef(false);

	useEffect(() => {
		const currentDynamicHue = Number.parseFloat(
			getComputedStyle(document.documentElement)
				.getPropertyValue("--piko-palette-dynamic-hue")
				.trim(),
		);

		if (!Number.isNaN(currentDynamicHue)) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- one-off mount hydration from the DOM
			setDynamicHue(currentDynamicHue);
		}
	}, []);

	useEffect(() => {
		if (!hasUserChangedHue.current) {
			hasUserChangedHue.current = true;
			return;
		}

		document.documentElement.style.setProperty(
			"--piko-palette-dynamic-hue",
			String(dynamicHue),
		);
	}, [dynamicHue]);

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		setDynamicHue(Number.parseFloat(event.currentTarget.value));
	}

	return (
		<div className={`piko-prose__block ${styles.hueControl}`}>
			<label htmlFor="piko-dynamic-hue">
				Today&apos;s hue: <span className={styles.hueDemo}>{dynamicHue}</span>
			</label>
			<input
				id="piko-dynamic-hue"
				type="range"
				min={0}
				max={360}
				step={1}
				value={dynamicHue}
				onChange={handleChange}
			/>
		</div>
	);
}
