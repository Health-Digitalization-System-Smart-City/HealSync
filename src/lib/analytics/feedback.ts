// Negative feedback sampling (Phase 2 — Tool 6 `getNegativeFeedback`).
//
// Lets the AI inspect a bounded, de-identified sample of negative feedback
// when it needs qualitative context. STRICT data-minimization: only rating,
// comment text, branch/service names, and timestamp are selected — never
// `phoneNumber`, `phoneNumberHash`, or any patient identity field
// (security.md §20, PRD §32). `limit` is capped server-side.

import { db } from "@/lib/db";
import {
  getRatingLabel,
  getRatingScore,
  isNeedsAttentionRating,
} from "@/lib/feedback/ratings";
import type { FeedbackRating } from "@/lib/feedback/types";
import type { NegativeFeedbackItem } from "./insights-types";

export const MAX_NEGATIVE_FEEDBACK_LIMIT = 20;

export type NegativeFeedbackInput = {
  start: Date;
  end: Date;
  branchId?: string;
  serviceId?: string;
  /** Max records returned; capped at MAX_NEGATIVE_FEEDBACK_LIMIT. */
  limit?: number;
};

/**
 * Returns representative negative ("needs attention") feedback for the period,
 * newest first. Never includes phone numbers or patient-identifying fields.
 */
export async function getNegativeFeedbackSample(
  input: NegativeFeedbackInput,
): Promise<NegativeFeedbackItem[]> {
  const limit = Math.min(
    Math.max(1, Math.floor(input.limit ?? 10)),
    MAX_NEGATIVE_FEEDBACK_LIMIT,
  );

  const rows = await db.feedback.findMany({
    where: {
      deletedAt: null,
      createdAt: { gte: input.start, lte: input.end },
      ...(input.branchId ? { branchId: input.branchId } : {}),
      ...(input.serviceId ? { serviceId: input.serviceId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit * 4, // fetch a buffer, then filter to needs-attention ratings
    select: {
      rating: true,
      comment: true,
      createdAt: true,
      branch: { select: { name: true } },
      service: { select: { name: true } },
    },
  });

  return rows
    .filter(
      (row) =>
        isNeedsAttentionRating(row.rating as FeedbackRating) &&
        (row.comment ?? "").trim().length > 0,
    )
    .slice(0, limit)
    .map((row) => ({
      rating: row.rating as FeedbackRating,
      ratingLabel: getRatingLabel(row.rating as FeedbackRating),
      ratingScore: getRatingScore(row.rating as FeedbackRating),
      text: (row.comment ?? "").trim(),
      branchName: row.branch?.name ?? "Unknown branch",
      serviceName: row.service?.name ?? "Unknown service",
      createdAt: row.createdAt.toISOString(),
    }));
}
