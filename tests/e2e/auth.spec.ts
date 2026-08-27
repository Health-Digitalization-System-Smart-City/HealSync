import { expect, test } from "@playwright/test";

// Credentials match the development seed (prisma/seed.ts defaults).
const ADMIN_EMAIL = "admin@healsync.com";
const ADMIN_PASSWORD = "Admin@12345";

test.describe("Authentication & RBAC", () => {
  test("unauthenticated users are redirected from the dashboard to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: /Sign in to the dashboard/i }),
    ).toBeVisible();
  });

  test("unauthenticated users cannot reach the users page", async ({
    page,
  }) => {
    await page.goto("/dashboard/users");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("heading", { name: /Sign in to the dashboard/i }),
    ).toBeVisible();
  });

  test("signing in with invalid credentials shows an error", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel(/Email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/Password/i).fill("WrongPassword123");
    await page.getByRole("button", { name: /Sign in/i }).click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test("an administrator can sign in and reach the dashboard", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel(/Email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/Password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /Sign in/i }).click();

    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: /Welcome back/i }),
    ).toBeVisible();
    // The seeded admin's name and role are shown in the dashboard header.
    await expect(page.getByText("System Admin")).toBeVisible();
    await expect(
      page.getByText("Admin", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Users", exact: true }),
    ).toBeVisible();
  });

  test("an administrator can open the user management page", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/Password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await page.waitForURL("**/dashboard");

    await page.getByRole("link", { name: "Users", exact: true }).click();
    await page.waitForURL("**/dashboard/users");

    await expect(
      page.getByRole("heading", { name: /User management/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Create dashboard user/i }),
    ).toBeVisible();
  });

  test("requesting a password reset shows the confirmation state", async ({
    page,
  }) => {
    await page.goto("/forgot-password");

    await page.getByLabel(/Email/i).fill(ADMIN_EMAIL);
    await page.getByRole("button", { name: /Send reset link/i }).click();

    // The endpoint always returns the same response (timing-attack
    // mitigation), and in dev the reset link is logged to the server console.
    await expect(
      page.getByRole("heading", { name: /Check your email/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Back to sign in/i }),
    ).toBeVisible();
  });

  test("a signed-in user can sign out back to the home page", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/Password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await page.waitForURL("**/dashboard");

    await page.getByRole("button", { name: /Sign out/i }).click();

    await page.waitForURL("**/");
    await expect(
      page.getByRole("heading", { name: /Tell us how your visit went/i }),
    ).toBeVisible();

    // The session is gone: accessing the dashboard redirects to login.
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
  });
});
