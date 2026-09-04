import adapter from "@sveltejs/adapter-node";

export default {
	kit: {
		alias: {
			"@": "src",
		},
		adapter: adapter(),
	},
	vite: {
		server: {
			port: 3000,
			host: "0.0.0.0",
		},
	},
};
