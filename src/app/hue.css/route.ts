import { getDailyHue, getSecondsUntilNextHue } from "@/lib/dynamic-hue.server";

export const dynamic = "force-dynamic";

export async function GET() {
	const hue = getDailyHue();
	const maxAge = getSecondsUntilNextHue();

	return new Response(`:root { --piko-palette-dynamic-hue: ${hue}; }\n`, {
		headers: {
			"Content-Type": "text/css; charset=utf-8",
			"Cache-Control": `public, max-age=${maxAge}`,
		},
	});
}
