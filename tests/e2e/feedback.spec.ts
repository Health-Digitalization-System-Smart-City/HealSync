import { expect, test } from "@playwright/test";

test.describe("Patient Feedback Page", () => {
  test("loads feedback page and displays step 1 phone input", async ({
    page,
  }) => {
    await page.goto("/feedback");

    await expect(page).toHaveTitle(/Patient Feedback | HealSync Healthcare/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Phone Number/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/Patient Phone Number/i)).toBeVisible();
  });

  test("validates invalid phone number input", async ({ page }) => {
    await page.goto("/feedback");

    await page.getByLabel(/Patient Phone Number/i).fill("123");
    await page
      .getByRole("button", { name: /Continue to Branch Selection/i })
      .click();

    await expect(
      page.getByText(/Please enter a valid phone number/i),
    ).toBeVisible();
  });
});
