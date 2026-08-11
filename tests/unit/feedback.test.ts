import { describe, expect, it } from "vitest";

import { submitFeedbackSchema } from "@/lib/validation/feedback";

describe("submitFeedbackSchema", () => {
  it("accepts valid feedback submission data", () => {
    const validInputs = [
      {
        phoneNumber: "0912345678",
        branchId: "branch-1",
        serviceId: "service-1",
        rating: "VERY_SATISFIED",
        comment: "Great service!",
      },
      {
        phoneNumber: "+251912345678",
        branchId: "branch-2",
        serviceId: "service-2",
        rating: "NEUTRAL",
      },
    ];

    for (const input of validInputs) {
      const result = submitFeedbackSchema.safeParse(input);
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid phone numbers", () => {
    const invalidInputs = [
      {
        phoneNumber: "123", // too short
        branchId: "branch-1",
        serviceId: "service-1",
        rating: "SATISFIED",
      },
      {
        phoneNumber: "abcdefghij", // non-numeric
        branchId: "branch-1",
        serviceId: "service-1",
        rating: "SATISFIED",
      },
      {
        phoneNumber: "", // empty
        branchId: "branch-1",
        serviceId: "service-1",
        rating: "SATISFIED",
      },
    ];

    for (const input of invalidInputs) {
      const result = submitFeedbackSchema.safeParse(input);
      expect(result.success).toBe(false);
    }
  });

  it("rejects missing branch or service", () => {
    const missingBranch = {
      phoneNumber: "0912345678",
      branchId: "",
      serviceId: "service-1",
      rating: "GOOD",
    };
    const missingService = {
      phoneNumber: "0912345678",
      branchId: "branch-1",
      serviceId: "",
      rating: "GOOD",
    };

    expect(submitFeedbackSchema.safeParse(missingBranch).success).toBe(false);
    expect(submitFeedbackSchema.safeParse(missingService).success).toBe(false);
  });

  it("rejects invalid rating values", () => {
    const invalidRating = {
      phoneNumber: "0912345678",
      branchId: "branch-1",
      serviceId: "service-1",
      rating: "SUPER_HAPPY",
    };

    expect(submitFeedbackSchema.safeParse(invalidRating).success).toBe(false);
  });

  it("rejects comments exceeding 1000 characters", () => {
    const longComment = "a".repeat(1001);
    const input = {
      phoneNumber: "0912345678",
      branchId: "branch-1",
      serviceId: "service-1",
      rating: "POOR",
      comment: longComment,
    };

    expect(submitFeedbackSchema.safeParse(input).success).toBe(false);
  });
});
