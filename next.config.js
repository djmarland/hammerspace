/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "standalone",
	reactCompiler: true,
	pageExtensions: ["ts", "tsx"],
	outputFileTracingIncludes: {
		"/**": ["./src/generated/**/*.node"],
	},
	experimental: {
		useLightningcss: true,
		lightningCssFeatures: {
			exclude: ["nesting", "light-dark"],
		},
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},
};

module.exports = nextConfig;
