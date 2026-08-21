"use server";

import crypto from "crypto";

import { db } from "@/lib/db";
import {
  submitFeedbackSchema,
  type SubmitFeedbackInput,
} from "@/lib/validation";

export interface SubmitFeedbackResult {
  id: string;
  createdAt: Date;
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

/**
 * Normalizes patient phone numbers to E.164 standard format (DATABASE.md §11).
 * Example: 0912345678 -> +251912345678
 */
function normalizePhoneNumber(rawPhone: string): string {
  const cleaned = rawPhone.replace(/[\s-]/g, "");
  if (cleaned.startsWith("0")) {
    return `+251${cleaned.slice(1)}`;
  }
  if (!cleaned.startsWith("+") && cleaned.startsWith("251")) {
    return `+${cleaned}`;
  }
  if (!cleaned.startsWith("+")) {
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Computes a salted SHA-256 hash of the normalized phone number
 * for duplicate submission checking without revealing raw phone numbers (API.md §24).
 */
function hashPhoneNumber(normalizedPhone: string): string {
  const salt = process.env.PHONE_HASH_SALT ?? "healsync_phone_salt_default";
  return crypto
    .createHash("sha256")
    .update(`${salt}:${normalizedPhone}`)
    .digest("hex");
}

/**
 * Public action: Submits patient feedback (API.md §11).
 * Validates input, verifies branch-service availability, normalizes phone number, and persists to DB.
 */
export async function submitFeedback(
  input: SubmitFeedbackInput,
): Promise<ActionResponse<SubmitFeedbackResult>> {
  try {
    const parseResult = submitFeedbackSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check your inputs and try again.",
          fieldErrors: parseResult.error.flatten().fieldErrors,
        },
      };
    }

    const { phoneNumber, branchId, serviceId, rating, comment, locale } =
      parseResult.data;

    // 1. Normalize phone number & compute hash
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const phoneHash = hashPhoneNumber(normalizedPhone);

    // 2. Validate Branch existence and active status
    const branch = await db.branch.findUnique({
      where: { id: branchId },
      select: { id: true, isActive: true },
    });

    if (!branch || !branch.isActive) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "The selected branch is invalid or unavailable.",
          fieldErrors: { branchId: ["Selected branch is unavailable."] },
        },
      };
    }

    // 3. Validate Service existence and active status
    const service = await db.service.findUnique({
      where: { id: serviceId },
      select: { id: true, isActive: true },
    });

    if (!service || !service.isActive) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "The selected service is invalid or unavailable.",
          fieldErrors: { serviceId: ["Selected service is unavailable."] },
        },
      };
    }

    // 4. Verify BranchService relationship is valid & active (DATABASE.md §15)
    const branchServiceLink = await db.branchService.findUnique({
      where: {
        branchId_serviceId: {
          branchId,
          serviceId,
        },
      },
      select: { isActive: true },
    });

    if (!branchServiceLink || !branchServiceLink.isActive) {
      return {
        success: false,
        error: {
          code: "INVALID_BRANCH_SERVICE",
          message:
            "The selected service is not currently offered at this branch.",
          fieldErrors: {
            serviceId: ["Service is not offered at the selected branch."],
          },
        },
      };
    }

    // 5. Store Feedback submission
    const feedback = await db.feedback.create({
      data: {
        phoneNumber: normalizedPhone,
        phoneNumberHash: phoneHash,
        branchId,
        serviceId,
        rating,
        comment: comment || null,
        locale,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: {
        id: feedback.id,
        createdAt: feedback.createdAt,
      },
    };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          "An unexpected error occurred while saving your feedback. Please try again.",
      },
    };
  }
}
