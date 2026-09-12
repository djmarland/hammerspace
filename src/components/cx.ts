/**
 * Tiny className joiner, standing in for `clsx` without adding a dependency.
 * Falsy values (undefined, null, false, "") are skipped.
 */
export function cx(...values: Array<string | false | null | undefined>) {
	return values.filter(Boolean).join(" ");
}
