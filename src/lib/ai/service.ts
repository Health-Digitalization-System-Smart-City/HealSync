// AI analysis service (ROADMAP 7.2 — "send minimal data → validate AI
// response → structured result").
//
// This module is the AI boundary: it builds the prompt, calls the Vercel AI
// SDK with a structured-output schema, and validates the result before it can
// be persisted or rendered. It has no database access and no knowledge of
// authentication — callers inject the generation function for testing.

import { generateText, Output } from "ai";

import { AiError, AiProviderError, AiValidationError } from "./errors";
import { getGenerationTimeoutMs, getModelName } from "./model";
import {
  buildDailyAnalysisPrompt,
  DAILY_ANALYSIS_SYSTEM_PROMPT,
  DAILY_ANALYSIS_PROMPT_VERSION,
} from "./prompts/daily-feedback-analysis";
import {
  buildClinicInsightsPrompt,
  CLINIC_INSIGHTS_SYSTEM_PROMPT,
  CLINIC_INSIGHTS_PROMPT_VERSION,
} from "./prompts/clinic-insights";
import {
  dailyAIInsightSchema,
  periodAIInsightSchema,
  type DailyAIInsight,
  type PeriodAIInsight,
} from "./schema";
import { createModel } from "./provider";
import type {
  DailyAnalysisInput,
  PeriodAnalysisInput,
} from "@/lib/ai-insights/types";

/**
 * The minimal contract the analysis flow needs from an LLM: return a raw
 * object for the given system + user prompt. Injectable so unit tests can
 * feed canned (valid or malformed) model output without a network call.
 */
export type GenerateStructuredFn = (input: {
  system: string;
  prompt: string;
}) => Promise<{ object: unknown }>;

export type StructuredGenerationOptions = {
  schema?: typeof dailyAIInsightSchema | typeof periodAIInsightSchema;
  /** Used for the SDK output name + description. Defaults to dailyAIInsight. */
  kind?: "daily" | "period";
};

/**
 * Default generator: Vercel AI SDK `generateText` with `Output.object`.
 * The SDK parses and validates the JSON against the schema; the service
 * re-validates so the app never trusts the provider implicitly.
 */
export async function defaultGenerateStructured(
  {
    system,
    prompt,
  }: {
    system: string;
    prompt: string;
  },
  options: StructuredGenerationOptions = {},
): Promise<{ object: unknown }> {
  const model = createModel(); // throws AiNotConfiguredError when misconfigured
  const startedAt = Date.now();
  const kind = options.kind ?? "daily";
  const schema = options.schema ?? dailyAIInsightSchema;
  const promptVersion =
    kind === "daily"
      ? DAILY_ANALYSIS_PROMPT_VERSION
      : CLINIC_INSIGHTS_PROMPT_VERSION;

  try {
    const result = await generateText({
      model,
      system,
      prompt,
      timeout: getGenerationTimeoutMs(),
      output: Output.object({
        schema,
        name: kind === "daily" ? "dailyAIInsight" : "periodAIInsight",
        description:
          kind === "daily"
            ? "Structured AI analysis of today's patient feedback for clinic management."
            : "Structured AI analysis of a period of patient feedback for clinic management.",
      }),
    });

    const durationMs = Date.now() - startedAt;
    console.log(
      `[ai-insights] Analysis succeeded in ${durationMs}ms (model: ${getModelName()}, prompt: ${promptVersion})`,
    );

    return { object: result.output };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    if (error instanceof AiError) throw error;
    console.error(
      `[ai-insights] AI provider call failed after ${durationMs}ms (model: ${getModelName()})`,
      error,
    );
    throw new AiProviderError("The AI provider call failed.", { cause: error });
  }
}

/**
 * Analyzes today's feedback and returns a schema-validated `DailyAIInsight`.
 *
 * Throws `AiError` subclasses on failure (not configured / provider /
 * validation). The caller decides how to surface that (e.g. `AI_ERROR`).
 */
export async function analyzeDailyFeedback(
  input: DailyAnalysisInput,
  generate: GenerateStructuredFn = defaultGenerateStructured,
): Promise<DailyAIInsight> {
  const prompt = buildDailyAnalysisPrompt(input);
  console.log(
    `[ai-insights] Analysis requested (feedback: ${input.stats.feedbackCount}, model: ${getModelName()})`,
  );

  const raw = await runStructuredGeneration({
    system: DAILY_ANALYSIS_SYSTEM_PROMPT,
    prompt,
    generate,
    schema: dailyAIInsightSchema,
    errorContext: "AI output failed schema validation — result discarded",
  });

  return raw as DailyAIInsight;
}

/**
 * Analyzes a period's deterministic facts and returns a schema-validated
 * `PeriodAIInsight` (Phase 2 — AI Insights page summary).
 *
 * Throws `AiError` subclasses on failure (not configured / provider /
 * validation). The caller decides how to surface that (e.g. `AI_ERROR`).
 */
export async function analyzePeriodFeedback(
  input: PeriodAnalysisInput,
  generate: GenerateStructuredFn = defaultGenerateStructured,
): Promise<PeriodAIInsight> {
  const prompt = buildClinicInsightsPrompt(input);
  console.log(
    `[ai-insights] Period analysis requested (feedback: ${input.clinic.feedbackCount}, model: ${getModelName()}, prompt: ${CLINIC_INSIGHTS_PROMPT_VERSION})`,
  );

  const raw = await runStructuredGeneration({
    system: CLINIC_INSIGHTS_SYSTEM_PROMPT,
    prompt,
    generate,
    schema: periodAIInsightSchema,
    errorContext:
      "AI period output failed schema validation — result discarded",
  });

  return raw as PeriodAIInsight;
}

/** Shared generation + validation pipeline for the structured-analysis flows. */
async function runStructuredGeneration({
  system,
  prompt,
  generate,
  schema,
  errorContext,
}: {
  system: string;
  prompt: string;
  generate: GenerateStructuredFn;
  schema: typeof dailyAIInsightSchema | typeof periodAIInsightSchema;
  errorContext: string;
}): Promise<unknown> {
  let raw: unknown;
  try {
    const result = await generate({ system, prompt });
    raw = result.object;
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiProviderError("The AI provider call failed.", { cause: error });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error("[ai-insights] " + errorContext, parsed.error.flatten());
    throw new AiValidationError(
      "The AI returned output that did not match the required schema.",
    );
  }

  return parsed.data;
}
