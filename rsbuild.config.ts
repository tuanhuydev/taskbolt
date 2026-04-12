import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

export default defineConfig({
	plugins: [
		pluginVue(),
		pluginModuleFederation({
			name: "taskbolt",
			filename: "remoteEntry.js",
			exposes: {
				"./App": "./src/App.vue",
			},
			shared: {
				vue: {
					singleton: true,
					strictVersion: false,
					requiredVersion: "^3.4.0",
					eager: true,
				},
			},
			dts: false, // Disable type generation for Vue files
		}),
	],

	source: {
		entry: {
			index: "./src/main.ts",
		},
		define: {
			"process.env.AUTH_URL": JSON.stringify(process.env.APP_AUTH_URL || ""),
		},
	},

	resolve: {
		alias: {
			"@": "./src",
		},
	},

	html: {
		template: "./src/index.html",
	},

	server: {
		port: 2001,
		open: false,
		// Serve index.html for all deep paths so Vue Router handles them client-side.
		// For the shell integration scenario, the React shell's dev server must also
		// have historyApiFallback (or equivalent) configured to fallback to its index.html.
		historyApiFallback: {
			// Rewrite any request that doesn't match a real file to index.html.
			// This covers both standalone (/active-sprint) and base-path dev
			// (/taskbolt/active-sprint) scenarios.
			rewrites: [{ from: /^\/.*$/, to: "/index.html" }],
			disableDotRule: true,
		},
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
			"Access-Control-Allow-Headers":
				"X-Requested-With, content-type, Authorization",
		},
	},

	output: {
		assetPrefix: "auto",
		distPath: {
			root: "dist",
		},
		cleanDistPath: true,
		sourceMap: {
			js: "source-map",
		},
	},

	tools: {
		rspack: {
			resolve: {
				extensions: [".ts", ".js", ".vue"],
			},
			module: {
				rules: [
					{
						test: /\.svg$/,
						type: "asset/resource",
						generator: {
							filename: "assets/icons/[name][ext]",
						},
					},
				],
			},
		},
	},

	performance: {
		chunkSplit: {
			strategy: "split-by-experience",
		},
	},

	dev: {
		hmr: true,
		liveReload: true,
	},
});
