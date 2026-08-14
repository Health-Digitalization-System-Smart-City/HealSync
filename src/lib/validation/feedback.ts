// Zod schemas for the feedback API (`docs/API.md` §5, §18).
//
// All external input is validated at the server boundary; client-side
// validation is only a UX aid and never a security control.

import { z } from "zod";
import { RATING_VALUES } from "@/lib/feedback/ratings";
import { RANGE_VALUES } from "@/lib/feedback/ranges";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/lib/feedback/service";

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
  .refine(
    (data) => data.rating !== undefined || data.comment !== undefined,
    { message: "Provide at least one field to update." },
  );

export type FeedbackUpdateBody = z.infer<typeof feedbackUpdateSchema>;
