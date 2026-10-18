/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "standalone",
	reactCompiler: true,
	pageExtensions: ["ts", "tsx"],
	images: {
		// Read at build time: only images from this host are optimised.
		remotePatterns: [new URL("https://assets.hammerspace.co.uk/**")],
		// Uploaded filenames are random UUIDs that are never reused, so an
		// optimised image can be cached for a year.
		minimumCacheTTL: 31536000,
		// In development the uploads are served from somewhere the app server
		// can't necessarily reach (e.g. nginx on localhost:80, which inside the
		// Docker container is the container itself), so serve images as-is.
		unoptimized: process.env.NODE_ENV !== "production",
	},
	outputFileTracingIncludes: {
		"/**": ["./src/generated/**/*.node"],
	},
	experimental: {
		useLightningcss: true,
		lightningCssFeatures: {
			exclude: ["nesting", "light-dark"],
		},
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
};

module.exports = nextConfig;
