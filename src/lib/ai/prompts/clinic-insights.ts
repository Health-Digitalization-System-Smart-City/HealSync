// Period feedback analysis prompt (Phase 2 — AI Insights page).
//
// Analyzes a period (today / 7 days / 30 days / 12 months / custom) from
// DETERMINISTIC facts only: clinic metrics, branch/service performance,
// aggregated themes, a bounded de-identified negative-feedback sample, and the
// current-vs-previous comparison. The LLM interprets facts — it never
// calculates statistics (Architecture.md §7).

import type { PeriodAnalysisInput } from "@/lib/ai-insights/types";

export const CLINIC_INSIGHTS_PROMPT_VERSION = "clinic-insights/v1";

/** How many feedback submissions count as "small" for this period analysis. */
export const PERIOD_SMALL_DATASET_THRESHOLD = 5;

export const CLINIC_INSIGHTS_SYSTEM_PROMPT = `You are Smart Feedback's AI Insights analyst. Smart Feedback is a patient
feedback platform for healthcare clinics. You analyze ONE period of patient
feedback (service experience and patient satisfaction) for clinic management,
using ONLY the deterministic statistics and data provided. You never calculate
statistics yourself — the database has already done that.

Your analysis objective:
1. Summarize what happened with patient feedback during this period.
2. Identify the most important positive and negative findings.
3. Point out areas that need attention (branches, services, themes).
4. Suggest practical, operational recommendations for management.

HARD RULES:

1. NEVER INVENT DATA. Every claim must be supported by the supplied
   statistics. If you state a number, it must come from the provided data.
   Never extrapolate beyond the data. Never claim a trend unless the supplied
   data supports it.

2. DISTINGUISH EVIDENCE FROM INTERPRETATION. For each key finding, explain the
   evidence behind it. When you interpret, say so explicitly.

3. NO MEDICAL JUDGMENTS. This is a service-experience analysis. NEVER:
   diagnose patients, give medical advice, evaluate treatment correctness,
   make clinical decisions, or infer medical conditions from feedback.

4. NO PERSONNEL JUDGMENTS. Never name, blame, or judge individual doctors,
   nurses, or staff. Refer to services and operational areas instead.

5. SMALL DATA. If the feedback count is below ${PERIOD_SMALL_DATASET_THRESHOLD},
   open the summary with an explicit acknowledgment that the data is limited
   and the observations should not be treated as a reliable trend.

6. PARTIAL THEMES. The theme list may cover only part of the period's feedback
   (check analyzedFeedbackCount vs feedbackCountInPeriod). If coverage is
   partial, say so — never present partial themes as the complete picture.

7. PRIVACY. The negative-feedback sample is de-identified. Never reference
   patient identity; never invent patient-identifying details.

8. RECOMMENDATIONS. Give 2-4 specific, practical, operational recommendations
   based on the supplied facts. Prioritize them (high/medium/low). Recommend
   investigation or operational actions — do not make unsupported management
   decisions (e.g. do not say "hire more doctors" without evidence).

9. SUMMARY. Keep the main summary concise (2-4 sentences).

10. OUTPUT FORMAT. Return ONLY valid JSON matching the required schema. No
    markdown, no commentary outside the JSON.

Required output schema:
{
  "summary": string (2-4 sentences answering "What happened with patient feedback this period?"),
  "overallSentiment": "positive" | "mixed" | "negative",
  "keyFindings": [
    {
      "type": "positive" | "negative" | "neutral",
      "title": string,
      "explanation": string (with evidence from the provided data),
      "evidenceCount": number (optional; count of supporting submissions)
    }
  ] (3-5 findings, prioritized by importance),
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": string,
      "explanation": string (how the data supports this recommendation)
    }
  ] (2-4 recommendations),
  "themes": [
    {
      "name": string,
      "sentiment": "positive" | "negative" | "mixed",
      "count": number,
      "percentage": number (optional, 0-100)
    }
  ]
}`;

function formatBranches(rows: PeriodAnalysisInput["branches"]): string {
  if (rows.length === 0) return "(no branch feedback in this period)";
  return rows
    .map(
      (row) =>
        `- ${row.branchName}: ${row.feedbackCount} submissions, avg ${row.averageRating.toFixed(1)}/7, satisfaction ${row.satisfactionRate}%${row.changeFromPreviousPeriod === null ? "" : ` (${row.changeFromPreviousPeriod >= 0 ? "+" : ""}${row.changeFromPreviousPeriod} pts vs previous period)`}`,
    )
    .join("\n");
}

function formatServices(rows: PeriodAnalysisInput["services"]): string {
  if (rows.length === 0) return "(no service feedback in this period)";
  return rows
    .map(
      (row) =>
        `- ${row.serviceName}: ${row.feedbackCount} submissions, avg ${row.averageRating.toFixed(1)}/7, satisfaction ${row.satisfactionRate}%${row.changeFromPreviousPeriod === null ? "" : ` (${row.changeFromPreviousPeriod >= 0 ? "+" : ""}${row.changeFromPreviousPeriod} pts vs previous period)`}`,
    )
    .join("\n");
}

function formatThemes(rows: PeriodAnalysisInput["themes"]): string {
  if (rows.length === 0) return "(no aggregated themes available)";
  return rows
    .map((row) => `- ${row.name}: ${row.count} mentions (${row.percentage}%)`)
    .join("\n");
}

function formatNegativeSamples(
  rows: PeriodAnalysisInput["negativeSamples"],
): string {
  if (rows.length === 0) return "(no negative feedback with comments)";
  return rows
    .map(
      (row) =>
        `- [${row.ratingLabel} (${row.ratingScore}/7)] ${row.branchName} | ${row.serviceName} | ${row.createdAt} | "${row.text}"`,
    )
    .join("\n");
}

/**
 * Builds the user message containing the period's deterministic facts. This is
 * the ONLY place data enters the prompt — no PII, no raw phone numbers, no
 * unbounded feedback text (only the capped negative sample).
 */
export function buildClinicInsightsPrompt(input: PeriodAnalysisInput): string {
  const { clinic, comparison, themesCoverage } = input;

  return `Period: ${input.periodLabel}
Start: ${input.startDate}
End: ${input.endDate}

== CLINIC SUMMARY (computed by the database) ==
- Feedback count: ${clinic.feedbackCount}
- Average rating: ${clinic.averageRating.toFixed(1)} / 7
- Satisfaction rate: ${clinic.satisfactionRate}%
- Positive feedback count: ${clinic.positiveCount}
- Neutral feedback count: ${clinic.neutralCount}
- Negative feedback count: ${clinic.negativeCount}

== COMPARISON WITH PREVIOUS PERIOD (computed by the database) ==
- Current: ${comparison.current.feedbackCount} submissions, avg ${comparison.current.averageRating.toFixed(1)}/7, satisfaction ${comparison.current.satisfactionRate}%
- Previous: ${comparison.previous.feedbackCount} submissions, avg ${comparison.previous.averageRating.toFixed(1)}/7, satisfaction ${comparison.previous.satisfactionRate}%
- Changes: ${comparison.changes.feedbackCount >= 0 ? "+" : ""}${comparison.changes.feedbackCount} submissions, ${comparison.changes.averageRating >= 0 ? "+" : ""}${comparison.changes.averageRating.toFixed(1)} avg rating, ${comparison.changes.satisfactionRate >= 0 ? "+" : ""}${comparison.changes.satisfactionRate} pts satisfaction

== BRANCH PERFORMANCE (ranked by the database) ==
${formatBranches(input.branches)}

== SERVICE PERFORMANCE (ranked by the database) ==
${formatServices(input.services)}

== AGGREGATED THEMES ==
Coverage: ${themesCoverage.analyzedFeedbackCount} of ${themesCoverage.feedbackCountInPeriod} feedback submissions analyzed.
${formatThemes(input.themes)}

== NEGATIVE FEEDBACK SAMPLE (de-identified, bounded) ==
${formatNegativeSamples(input.negativeSamples)}

Analyze the data above following your hard rules and return the JSON result.`;
}
