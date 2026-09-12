import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
	...nextCoreWebVitals,
	...nextTypescript,
	{
		ignores: [".next/", "build/", "dist/"],
	},
	{
		rules: {
			"@next/next/no-html-link-for-pages": "off",
		},
	},
];

export default config;
