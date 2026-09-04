<script lang="ts">
	interface Props {
		propertyName: string;
	}

	const { propertyName }: Props = $props();

	let value = $state("—");

	const resolveComputedCssValue = (name: string) => {
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
	};

	$effect(() => {
		value = resolveComputedCssValue(propertyName);
	});
</script>

{value}
