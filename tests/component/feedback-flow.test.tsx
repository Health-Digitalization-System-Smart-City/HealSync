// @vitest-environment jsdom

import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PatientFeedbackForm } from "@/features/feedback/components/feedback-form";

const mocks = vi.hoisted(() => ({
  getBranches: vi.fn(),
  getServiceByBranch: vi.fn(),
  submitFeedback: vi.fn(),
}));

vi.mock("@/features/branches/actions", () => ({
  getBranches: mocks.getBranches,
}));
vi.mock("@/features/services/actions", () => ({
  getServiceByBranch: mocks.getServiceByBranch,
}));
vi.mock("@/features/feedback/actions", () => ({
  submitFeedback: mocks.submitFeedback,
}));

const BRANCHES = [
  { id: "b1", name: "Branch 01", code: "BR-01", isActive: true },
  { id: "b2", name: "Branch 02", code: "BR-02", isActive: true },
];

const SERVICES = [
  {
    id: "s1",
    name: "Pharmacy",
    description: "Dispensing of prescribed medications.",
    isActive: true,
  },
  {
    id: "s2",
    name: "Laboratory",
    description: "Diagnostic tests and sample analysis.",
    isActive: true,
  },
];

function okBranches(data: typeof BRANCHES = BRANCHES) {
  return { success: true, data };
}

function okServices(data: typeof SERVICES = SERVICES) {
  return { success: true, data };
}

function renderForm(options: { initialBranches?: typeof BRANCHES } = {}) {
  const initialBranches =
    options.initialBranches === undefined ? BRANCHES : options.initialBranches;
  return render(<PatientFeedbackForm initialBranches={initialBranches} />);
}

/** Advances the form through steps 1–3 (phone → branch → service). */
async function advanceToRating(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Patient Phone Number/i), "0912345678");
  await user.click(
    screen.getByRole("button", { name: /Continue to Branch Selection/i }),
  );
  await screen.findByRole("heading", { name: /Select Branch/i });

  await user.click(screen.getByRole("radio", { name: /Branch 01/i }));
  await screen.findByRole("heading", { name: /Select Service/i });

  await user.click(screen.getByRole("radio", { name: /Pharmacy/i }));
  await screen.findByRole("heading", { name: /Rate Your Experience/i });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getServiceByBranch.mockResolvedValue(okServices());
  mocks.submitFeedback.mockResolvedValue({
    success: true,
    data: { id: "fb_1234567890abcdef", createdAt: new Date() },
  });
});

describe("PatientFeedbackForm — complete flow", () => {
  it("submits the full flow and shows the success confirmation", async () => {
    const user = userEvent.setup();
    renderForm();
    await advanceToRating(user);

    await user.click(screen.getByRole("radio", { name: /Very Satisfied/i }));
    await user.type(
      screen.getByLabelText(/Written Feedback/i),
      "The staff was excellent.",
    );
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    const confirmation = await screen.findByRole("heading", {
      name: /Thank You for Your Feedback/i,
    });
    expect(confirmation).toBeVisible();

    expect(mocks.submitFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        phoneNumber: "0912345678",
        branchId: "b1",
        serviceId: "s1",
        rating: "VERY_SATISFIED",
        comment: "The staff was excellent.",
      }),
    );

    expect(screen.getByText(/Reference ID/i)).toBeVisible();
    expect(screen.getByText("fb_1234567890")).toBeVisible();
    expect(screen.getByText("Branch 01")).toBeVisible();
    expect(screen.getByText("Pharmacy")).toBeVisible();

    // "Submit another response" resets to the first step.
    await user.click(
      screen.getByRole("button", { name: /Submit Another Response/i }),
    );
    expect(
      screen.getByRole("heading", { name: /Phone Number/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Patient Phone Number/i)).toHaveValue("");
  });

  it("completes the flow on both mobile and desktop viewports", async () => {
    for (const width of [390, 1280]) {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: width,
      });
      const user = userEvent.setup();
      const { unmount } = renderForm();
      await advanceToRating(user);
      await user.click(screen.getByRole("radio", { name: /Neutral/i }));
      await user.click(
        screen.getByRole("button", { name: /Submit Feedback/i }),
      );
      expect(
        await screen.findByRole("heading", {
          name: /Thank You for Your Feedback/i,
        }),
      ).toBeVisible();
      expect(mocks.submitFeedback).toHaveBeenLastCalledWith(
        expect.objectContaining({ rating: "NEUTRAL" }),
      );
      unmount();
    }
  });
});

describe("PatientFeedbackForm — validation feedback", () => {
  it("shows a validation error for an invalid phone number", async () => {
    const user = userEvent.setup();
    renderForm();

    const phoneInput = screen.getByLabelText(/Patient Phone Number/i);
    await user.type(phoneInput, "123");
    await user.click(
      screen.getByRole("button", { name: /Continue to Branch Selection/i }),
    );

    const error = await screen.findByText(/Please enter a valid phone number/i);
    expect(error).toBeVisible();
    expect(phoneInput).toHaveAttribute("aria-invalid", "true");
    expect(phoneInput).toHaveAccessibleDescription(
      /Please enter a valid phone/i,
    );

    // Correcting the input clears the field error.
    await user.clear(phoneInput);
    await user.type(phoneInput, "0912345678");
    expect(screen.queryByText(/Please enter a valid phone number/i)).toBeNull();
    expect(phoneInput).toHaveAttribute("aria-invalid", "false");
  });

  it("reports a missing phone number as required", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(
      screen.getByRole("button", { name: /Continue to Branch Selection/i }),
    );
    expect(await screen.findByText(/Phone number is required/i)).toBeVisible();
  });

  it("validates the phone number on blur", async () => {
    const user = userEvent.setup();
    renderForm();
    const phoneInput = screen.getByLabelText(/Patient Phone Number/i);
    await user.type(phoneInput, "not-a-number");
    await user.tab();
    expect(
      await screen.findByText(/Please enter a valid phone number/i),
    ).toBeVisible();
  });

  it("requires a rating before submitting", async () => {
    const user = userEvent.setup();
    renderForm();
    await advanceToRating(user);
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    expect(
      await screen.findByText(/Please select a rating option/i),
    ).toBeVisible();
    expect(mocks.submitFeedback).not.toHaveBeenCalled();
  });

  it("enforces the comment character limit counter", async () => {
    const user = userEvent.setup();
    renderForm();
    await advanceToRating(user);
    const comment = screen.getByLabelText(/Written Feedback/i);
    await user.type(comment, "a".repeat(25));
    expect(screen.getByText(/25 \/ 1000/i)).toBeVisible();
  });
});

describe("PatientFeedbackForm — loading, error and empty states", () => {
  it("shows a loading state while branches are being fetched", async () => {
    mocks.getBranches.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderForm({ initialBranches: [] });
    expect(
      await screen.findByRole("status", { name: /Loading clinic branches/i }),
    ).toBeVisible();
    unmount();
  });

  it("shows an error state with retry when branches fail to load", async () => {
    mocks.getBranches.mockResolvedValue({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Unable to retrieve branch list. Please try again later.",
      },
    });
    const user = userEvent.setup();
    const { unmount } = renderForm({ initialBranches: [] });

    expect(
      await screen.findByRole("alert", { name: /Couldn't load branches/i }),
    ).toBeVisible();

    mocks.getBranches.mockResolvedValue(okBranches());
    await user.click(screen.getByRole("button", { name: /Try again/i }));
    expect(
      await screen.findByRole("radio", { name: /Branch 01/i }),
    ).toBeVisible();
    unmount();
  });

  it("shows an empty state when no branches are configured", async () => {
    mocks.getBranches.mockResolvedValue(okBranches([]));
    // const user = userEvent.setup();
    const { unmount } = renderForm({ initialBranches: [] });
    expect(await screen.findByText(/No branches available/i)).toBeVisible();
    unmount();
  });

  it("shows an error state with retry when services fail to load", async () => {
    mocks.getServiceByBranch.mockResolvedValue({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Unable to retrieve service list. Please try again later.",
      },
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/Patient Phone Number/i),
      "0912345678",
    );
    await user.click(
      screen.getByRole("button", { name: /Continue to Branch Selection/i }),
    );
    await screen.findByRole("heading", { name: /Select Branch/i });
    await user.click(screen.getByRole("radio", { name: /Branch 01/i }));

    expect(
      await screen.findByRole("alert", { name: /Couldn't load services/i }),
    ).toBeVisible();

    mocks.getServiceByBranch.mockResolvedValue(okServices());
    await user.click(screen.getByRole("button", { name: /Try again/i }));
    expect(
      await screen.findByRole("radio", { name: /Pharmacy/i }),
    ).toBeVisible();
  });

  it("shows an empty state when the selected branch has no services", async () => {
    mocks.getServiceByBranch.mockResolvedValue(okServices([]));
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/Patient Phone Number/i),
      "0912345678",
    );
    await user.click(
      screen.getByRole("button", { name: /Continue to Branch Selection/i }),
    );
    await screen.findByRole("heading", { name: /Select Branch/i });
    await user.click(screen.getByRole("radio", { name: /Branch 01/i }));

    expect(
      await screen.findByText(/No services available at this branch/i),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: /Choose a different branch/i }),
    );
    expect(
      screen.getByRole("heading", { name: /Select Branch/i }),
    ).toBeVisible();
  });
});

describe("PatientFeedbackForm — invalid branch-service combination", () => {
  it("routes back to service selection and reloads services", async () => {
    const user = userEvent.setup();
    renderForm();
    await advanceToRating(user);
    await user.click(screen.getByRole("radio", { name: /Very Satisfied/i }));

    mocks.submitFeedback.mockResolvedValue({
      success: false,
      error: {
        code: "INVALID_BRANCH_SERVICE",
        message:
          "The selected service is not currently offered at this branch.",
        fieldErrors: {
          serviceId: ["Service is not offered at the selected branch."],
        },
      },
    });
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    // Back on the service step with an explanatory alert.
    expect(
      await screen.findByRole("heading", { name: /Select Service/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("alert", {
        name: /The selected service is not currently offered/i,
      }),
    ).toBeVisible();

    // Services are re-fetched for the branch.
    expect(mocks.getServiceByBranch).toHaveBeenCalledWith({ branchId: "b1" });
  });

  it("shows a generic submission error alert", async () => {
    mocks.submitFeedback.mockResolvedValue({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          "An unexpected error occurred while saving your feedback. Please try again.",
      },
    });
    const user = userEvent.setup();
    renderForm();
    await advanceToRating(user);
    await user.click(screen.getByRole("radio", { name: /Good/i }));
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    expect(
      await screen.findByRole("alert", {
        name: /unexpected error occurred while saving your feedback/i,
      }),
    ).toBeVisible();
  });
});

describe("PatientFeedbackForm — accessibility", () => {
  it("exposes each selection as a labelled radio group", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/Patient Phone Number/i),
      "0912345678",
    );
    await user.click(
      screen.getByRole("button", { name: /Continue to Branch Selection/i }),
    );
    await screen.findByRole("heading", { name: /Select Branch/i });

    const branchGroup = screen.getByRole("group", {
      name: /Choose the clinic branch you visited/i,
    });
    expect(within(branchGroup).getAllByRole("radio")).toHaveLength(2);

    await user.click(screen.getByRole("radio", { name: /Branch 01/i }));
    await screen.findByRole("heading", { name: /Select Service/i });
    const serviceGroup = screen.getByRole("group", {
      name: /Select the service or department you visited/i,
    });
    expect(within(serviceGroup).getAllByRole("radio")).toHaveLength(2);

    await user.click(screen.getByRole("radio", { name: /Pharmacy/i }));
    await screen.findByRole("heading", { name: /Rate Your Experience/i });
    const ratingGroup = screen.getByRole("group", {
      name: /Overall Rating/i,
    });
    expect(within(ratingGroup).getAllByRole("radio")).toHaveLength(8);
  });

  it("marks the current step and completed steps in the stepper", async () => {
    const user = userEvent.setup();
    renderForm();
    const stepper = screen.getByRole("navigation", {
      name: /Feedback progress/i,
    });

    expect(
      within(stepper).getByRole("button", { name: /Step 1 of 4: Phone/i }),
    ).toHaveAttribute("aria-current", "step");
    expect(
      within(stepper).getByRole("button", { name: /Step 2 of 4: Branch/i }),
    ).toBeDisabled();

    await user.type(
      screen.getByLabelText(/Patient Phone Number/i),
      "0912345678",
    );
    await user.click(
      screen.getByRole("button", { name: /Continue to Branch Selection/i }),
    );
    await screen.findByRole("heading", { name: /Select Branch/i });

    expect(
      within(stepper).getByRole("button", {
        name: /Step 1 of 4: Phone \(completed\)/i,
      }),
    ).toBeVisible();
    expect(
      within(stepper).getByRole("button", { name: /Step 2 of 4: Branch/i }),
    ).toHaveAttribute("aria-current", "step");
  });
});
