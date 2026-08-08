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
    // Only pick up unit tests; Playwright specs live in tests/e2e and are
    // handled by the separate Playwright runner.
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    environment: "node",
  },
});
