// Centralized rating definition (`docs/database.md` §12, `docs/PRD.md` §10).
//
// The rating scale is a fixed, controlled set. Components must not invent their
// own rating values; they should consume these constants and helpers.

import type { FeedbackRating, RatingOption } from "./types";

export const RATING_VALUES = [
  "VERY_SATISFIED",
  "SATISFIED",
  "MOSTLY_SATISFIED",
  "GOOD",
  "NEUTRAL",
  "NOT_SATISFIED",
  "POOR",
  "VERY_POOR",
] as const satisfies readonly FeedbackRating[];

export const RATING_OPTIONS: RatingOption[] = [
  { value: "VERY_SATISFIED", label: "Very Satisfied", score: 7 },
  { value: "SATISFIED", label: "Satisfied", score: 6 },
  { value: "MOSTLY_SATISFIED", label: "Mostly Satisfied", score: 5 },
  { value: "GOOD", label: "Good", score: 4 },
  { value: "NEUTRAL", label: "Neutral", score: 3 },
  { value: "NOT_SATISFIED", label: "Not Satisfied", score: 2 },
  { value: "POOR", label: "Poor", score: 1 },
  { value: "VERY_POOR", label: "Very Poor", score: 0 },
];

const RATING_INDEX = new Map<string, RatingOption>(
  RATING_OPTIONS.map((option) => [option.value, option]),
);

export function getRatingOption(rating: FeedbackRating): RatingOption {
  const option = RATING_INDEX.get(rating);
  if (!option) {
    throw new Error(`Unknown rating: ${rating}`);
  }
  return option;
}

export function getRatingLabel(rating: FeedbackRating): string {
  return getRatingOption(rating).label;
}

export function getRatingScore(rating: FeedbackRating): number {
  return getRatingOption(rating).score;
}

export function isPositiveRating(rating: FeedbackRating): boolean {
  return getRatingScore(rating) >= 5;
}

export function isNeutralRating(rating: FeedbackRating): boolean {
  const score = getRatingScore(rating);
  return score >= 3 && score <= 4;
}

export function isNeedsAttentionRating(rating: FeedbackRating): boolean {
  return getRatingScore(rating) <= 2;
}

export function isFeedbackRating(value: unknown): value is FeedbackRating {
  return (
    typeof value === "string" &&
    RATING_OPTIONS.some((option) => option.value === value)
  );
}
