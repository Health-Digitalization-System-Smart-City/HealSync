// Structured AI output contract (API.md §21).
//
// The LLM returns a JSON object matching this schema; the backend validates it
// before it is persisted or rendered. Malformed output is never trusted —
// `dailyAIInsightSchema` is the single gatekeeper between the model and the
// dashboard UI.

import { z } from "zod";

export const overallSentimentSchema = z.enum(["positive", "mixed", "negative"]);
export type OverallSentiment = z.infer<typeof overallSentimentSchema>;

export const findingTypeSchema = z.enum(["positive", "negative", "neutral"]);
export type FindingType = z.infer<typeof findingTypeSchema>;

export const themeSentimentSchema = z.enum(["positive", "negative", "mixed"]);
export type ThemeSentiment = z.infer<typeof themeSentimentSchema>;

export const prioritySchema = z.enum(["high", "medium", "low"]);
export type Priority = z.infer<typeof prioritySchema>;

export const keyFindingSchema = z.object({
  /** Short title, e.g. "Waiting time". */
  title: z.string().trim().min(1).max(200),
  /** Positive / Negative / Neutral indicator. */
  type: findingTypeSchema,
  /** Why the AI reached this conclusion (evidence-based). */
  explanation: z.string().trim().min(1).max(1000),
  /** Number of submissions supporting the finding, when available. */
  evidenceCount: z.number().int().min(0).max(100_000).optional(),
});
export type KeyFinding = z.infer<typeof keyFindingSchema>;

export const recommendationSchema = z.object({
  priority: prioritySchema,
  title: z.string().trim().min(1).max(200),
  explanation: z.string().trim().min(1).max(1000),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

export const themeSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sentiment: themeSentimentSchema,
  count: z.number().int().min(0).max(100_000),
  percentage: z.number().min(0).max(100).optional(),
});
export type Theme = z.infer<typeof themeSchema>;

/**
 * The validated body of an AI analysis (Phase 1 — "today's feedback").
 *
 * `metadata` is added server-side after validation; it never comes from the
 * model so the model cannot lie about the period or the feedback count.
 */
export const dailyAIInsightSchema = z.object({
  /** 2–4 sentence answer to "What happened with patient feedback today?". */
  summary: z.string().trim().min(1).max(4000),
  overallSentiment: overallSentimentSchema,
  keyFindings: z.array(keyFindingSchema).min(1).max(10),
  recommendations: z.array(recommendationSchema).min(1).max(10),
  themes: z.array(themeSchema).min(1).max(20),
});
export type DailyAIInsight = z.infer<typeof dailyAIInsightSchema>;

export type DailyAIInsightMetadata = {
  feedbackCount: number;
  generatedAt: string; // ISO timestamp of when the analysis was produced
  period: "today";
};

/** The full persisted insight: validated model output + server metadata. */
export type DailyAIInsightResult = DailyAIInsight & {
  metadata: DailyAIInsightMetadata;
};

export function isDailyAIInsight(value: unknown): value is DailyAIInsight {
  return dailyAIInsightSchema.safeParse(value).success;
}
