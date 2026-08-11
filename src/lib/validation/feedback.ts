import { z } from "zod";

/**
 * Supported Feedback Ratings enum values matching Prisma schema (DATABASE.md §12).
 */
export const FeedbackRatingEnum = z.enum([
  "VERY_SATISFIED",
  "SATISFIED",
  "MOSTLY_SATISFIED",
  "GOOD",
  "NEUTRAL",
  "NOT_SATISFIED",
  "POOR",
  "VERY_POOR",
]);

export type FeedbackRating = z.infer<typeof FeedbackRatingEnum>;

/**
 * Phone number regex validation:
 * Supports international E.164 format (+251912345678) or local Ethiopian formats (0912345678 / 0712345678).
 */
const phoneNumberRegex = /^(\+251|0)?[79]\d{8}$|^(\+\d{1,3})?\d{8,14}$/;

export const submitFeedbackSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine((val) => phoneNumberRegex.test(val.replace(/[\s-]/g, "")), {
      message:
        "Please enter a valid phone number (e.g., 0912345678 or +251912345678)",
    }),
  branchId: z.string().min(1, "Please select a clinic branch"),
  serviceId: z.string().min(1, "Please select a service or department"),
  rating: FeedbackRatingEnum,
  comment: z
    .string()
    .trim()
    .max(1000, "Comment cannot exceed 1,000 characters")
    .optional(),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

export const getServicesSchema = z.object({
  branchId: z.string().optional(),
});

export type GetServicesInput = z.infer<typeof getServicesSchema>;
