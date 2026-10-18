import { getDailyHue, getSecondsUntilNextHue } from "@/lib/dynamic-hue.server";
import { faviconSvg } from "@/lib/favicon";

export const dynamic = "force-dynamic";

export async function GET() {
	const hue = getDailyHue();
	const maxAge = getSecondsUntilNextHue();

	return new Response(faviconSvg(hue), {
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			"Cache-Control": `public, max-age=${maxAge}`,
		},
	});
}
