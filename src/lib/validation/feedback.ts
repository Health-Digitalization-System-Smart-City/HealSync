import { z } from "zod";
import { RATING_VALUES } from "@/lib/feedback/ratings";
import { RANGE_VALUES } from "@/lib/feedback/ranges";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/feedback/service";

export const feedbackListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  branchId: z.string().min(1).optional(),
  serviceId: z.string().min(1).optional(),
  rating: z.enum(RATING_VALUES).optional(),
  range: z.enum(RANGE_VALUES).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export type FeedbackListQuery = z.infer<typeof feedbackListQuerySchema>;

export const feedbackUpdateSchema = z
  .object({
    rating: z.enum(RATING_VALUES).optional(),
    comment: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "Provide at least one field to update.",
  });

export type FeedbackUpdateBody = z.infer<typeof feedbackUpdateSchema>;

/**
 * Supported Feedback Ratings enum values matching Prisma schema (DATABASE.md §12).
 */
export const FeedbackRatingEnum = z.enum(
  [
    "VERY_SATISFIED",
    "SATISFIED",
    "MOSTLY_SATISFIED",
    "GOOD",
    "NEUTRAL",
    "NOT_SATISFIED",
    "POOR",
    "VERY_POOR",
  ],
  { message: "Please select a rating option." },
);

export type FeedbackRating = z.infer<typeof FeedbackRatingEnum>;

/**
 * Phone number regex validation:
 * Supports international E.164 format (+251912345678) or local Ethiopian formats (0912345678 / 0712345678).
 */
const phoneNumberRegex = /^(\+251|0)?[79]\d{8}$|^(\+\d{1,3})?\d{8,14}$/;

export const FEEDBACK_COMMENT_MAX_LENGTH = 1000;
export const feedbackLocaleSchema = z.enum(["en", "am", "om"]);

export const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine((val) => phoneNumberRegex.test(val.replace(/[\s-]/g, "")), {
    message:
      "Please enter a valid phone number (e.g., 0912345678 or +251912345678)",
  });

export const feedbackCommentSchema = z
  .string()
  .trim()
  .max(
    FEEDBACK_COMMENT_MAX_LENGTH,
    `Comment cannot exceed ${FEEDBACK_COMMENT_MAX_LENGTH} characters`,
  )
  .optional();

export const submitFeedbackSchema = z.object({
  phoneNumber: phoneNumberSchema,
  branchId: z.string().min(1, "Please select a clinic branch"),
  serviceId: z.string().min(1, "Please select a service or department"),
  rating: FeedbackRatingEnum,
  comment: feedbackCommentSchema,
  locale: feedbackLocaleSchema.default("en"),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

export const getServiceByBranchSchema = z.object({
  branchId: z.string().min(1, "branchId is required"),
});

export type GetServiceByBranchInput = z.infer<typeof getServiceByBranchSchema>;
