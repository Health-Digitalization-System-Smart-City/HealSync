// Playwright configuration for end-to-end tests (tests/e2e).
import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Give cold navigations enough headroom on slower machines.
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // E2E runs against the production server: routes are pre-compiled, which
  // keeps test timing predictable (a cold `next dev` compile can take 40s+ on
  // slow filesystems). `pnpm test:e2e` therefore builds the app first.
  // BETTER_AUTH_RATE_LIMIT_RELAXED widens Better Auth's sign-in rate limit
  // (default 3/10s) so parallel tests can sign in freely; never set it in
  // production.
  webServer: {
    command: `BETTER_AUTH_RATE_LIMIT_RELAXED=true pnpm build && BETTER_AUTH_RATE_LIMIT_RELAXED=true pnpm start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 420_000,
  },
});
