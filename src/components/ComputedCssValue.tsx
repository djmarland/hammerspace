"use client";

import { useEffect, useState } from "react";

interface ComputedCssValueProps {
	propertyName: string;
}

function resolveComputedCssValue(name: string) {
	if (typeof document === "undefined") {
		return "—";
	}

	const rootStyle = getComputedStyle(document.documentElement);

	if (!name.startsWith("--")) {
		return rootStyle.getPropertyValue(name).trim() || "—";
	}

	const rawValue = rootStyle.getPropertyValue(name).trim();
	if (!rawValue) return "—";

	// Resolve custom properties through layout so calc()/var() are returned as final lengths.
	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";
	probe.style.width = `var(${name})`;
	document.body.append(probe);

	const computedValue = getComputedStyle(probe).width.trim();
	probe.remove();

	return computedValue || rawValue;
}

export default function ComputedCssValue({
	propertyName,
}: ComputedCssValueProps) {
	const [value, setValue] = useState("—");

	useEffect(() => {
		// Reading computed styles/layout requires the DOM, which doesn't
		// exist on the server or during render - this measurement can only
		// happen after mount, so setState here is the correct escape hatch.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setValue(resolveComputedCssValue(propertyName));
	}, [propertyName]);

	return <>{value}</>;
}
