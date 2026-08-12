// Vitest configuration for unit tests (tests/unit).
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Only pick up unit + component tests; Playwright specs live in tests/e2e
    // and are handled by the separate Playwright runner. Component tests use
    // `// @vitest-environment jsdom` to opt into a DOM environment.
    include: [
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
      "tests/component/**/*.{test,spec}.{ts,tsx}",
    ],
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
  },
});
