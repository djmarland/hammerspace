/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	pageExtensions: ["ts", "tsx"],
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
