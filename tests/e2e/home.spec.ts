// Smoke test — proves the application boots and the root route responds.
// Product-level e2e tests will be added in later phases.
import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Smart Feedback/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Smart Feedback/ }),
  ).toBeVisible();
});
