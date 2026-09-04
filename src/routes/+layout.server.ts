import { getDailyHue } from "@/lib/dynamic-hue.server";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
	return { dynamicHue: getDailyHue() };
};
