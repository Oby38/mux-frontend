import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.tsx"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "html"],
			include: [
				"src/components/wallet/**",
				"src/components/analytics/**",
				"src/utils/**",
				"src/hooks/**",
				"src/mock-data/**",
				"src/app/**/wallets/**",
				"src/app/**/analytics/**",
			],
			exclude: ["src/test/**", "**/*.d.ts"],
		},
	},
});
