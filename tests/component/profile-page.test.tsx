// @vitest-environment jsdom
//
// Profile & Security page: identity display, plain-language role capabilities,
// and the self-service change-password form. The Better Auth client is mocked
// — these tests verify the UI renders each state correctly, not Better Auth
// itself.

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ProfileClient } from "@/components/dashboard/profile-client";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";

vi.mock("@/lib/auth/client", () => ({
  authClient: { changePassword: vi.fn() },
}));

import { authClient } from "@/lib/auth/client";

const changePassword = vi.mocked(authClient.changePassword);

const ADMIN_PROPS = {
  user: {
    id: "usr-1",
    name: "Alice Admin",
    email: "alice@healsync.com",
    role: "Admin" as const,
  },
  createdAt: "2026-01-10T08:00:00.000Z",
  lastLoginAt: "2026-08-15T09:30:00.000Z",
  isActive: true,
};

describe("ProfileClient", () => {
  it("renders the identity card with name, email, role, and admin-managed notice", () => {
    render(<ProfileClient {...ADMIN_PROPS} />);

    expect(screen.getByText("Alice Admin")).toBeTruthy();
    expect(screen.getByText("alice@healsync.com")).toBeTruthy();
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
    expect(
      screen.getByText((content) =>
        content.includes("assigned by your administrator"),
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(/password is the only detail you can update/i),
    ).toBeTruthy();
  });

  it("shows the self-service change-password card", () => {
    render(<ProfileClient {...ADMIN_PROPS} />);

    expect(screen.getByText("Change your password")).toBeTruthy();
    expect(
      screen.getByText(/it's never shown to anyone, not even administrators/i),
    ).toBeTruthy();
  });

  it("lists the admin role's capabilities in plain language, without system internals", () => {
    render(<ProfileClient {...ADMIN_PROPS} />);

    expect(screen.getByText("What your Admin role can do")).toBeTruthy();
    expect(screen.getByText("Patient feedback")).toBeTruthy();
    expect(screen.getByText("Review patient feedback")).toBeTruthy();
    expect(screen.getByText("See patient contact details")).toBeTruthy();
    expect(screen.getByText("Analytics & AI")).toBeTruthy();
    expect(screen.getByText("Use AI insights")).toBeTruthy();
    expect(screen.getByText("Clinic branches")).toBeTruthy();
    expect(screen.getByText("Add new branches")).toBeTruthy();
    expect(screen.getByText("Users & access")).toBeTruthy();
    expect(screen.getByText("Disable accounts")).toBeTruthy();

    // No system-internal claims on the page.
    expect(screen.queryByText(/RBAC/i)).toBeNull();
    expect(screen.queryByText(/TLS/i)).toBeNull();
    expect(screen.queryByText(/Better Auth/i)).toBeNull();
  });

  it("shows a smaller capability set for an Analyst", () => {
    render(
      <ProfileClient
        {...ADMIN_PROPS}
        user={{ ...ADMIN_PROPS.user, name: "Ana Analyst", role: "Analyst" }}
      />,
    );

    expect(screen.getByText("What your Analyst role can do")).toBeTruthy();
    expect(screen.getByText("Review patient feedback")).toBeTruthy();
    expect(screen.getByText("Use AI insights")).toBeTruthy();

    // Analyst has no branch, service, user, or feedback-edit capabilities.
    expect(screen.queryByText("Clinic branches")).toBeNull();
    expect(screen.queryByText("Medical services")).toBeNull();
    expect(screen.queryByText("Users & access")).toBeNull();
    expect(screen.queryByText("Update and respond to feedback")).toBeNull();
  });
});

describe("ChangePasswordForm", () => {
  it("requires matching passwords of at least 8 characters before submitting", async () => {
    changePassword.mockResolvedValue({ data: null, error: null });

    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "old-password-123" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-pass-456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different-789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));

    expect(
      await screen.findByText(/your new passwords do not match/i),
    ).toBeTruthy();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("submits and shows the success message on a successful change", async () => {
    changePassword.mockResolvedValue({ data: null, error: null });

    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "old-password-123" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-password-456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new-password-456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        currentPassword: "old-password-123",
        newPassword: "new-password-456",
        revokeOtherSessions: true,
      });
    });
    expect(
      await screen.findByText(/your password has been updated/i),
    ).toBeTruthy();
  });

  it("maps an invalid current password error to a friendly message", async () => {
    changePassword.mockResolvedValue({
      data: null,
      error: { code: "INVALID_PASSWORD", message: "invalid password" },
    });

    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "wrong-current" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-password-456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new-password-456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));

    expect(
      await screen.findByText(/your current password is incorrect/i),
    ).toBeTruthy();
    expect(screen.queryByText(/your password has been updated/i)).toBeNull();
  });
});
