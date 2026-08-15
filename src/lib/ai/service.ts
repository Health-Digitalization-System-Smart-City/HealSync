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
import { dailyAIInsightSchema, type DailyAIInsight } from "./schema";
import { createModel } from "./provider";
import type { DailyAnalysisInput } from "@/lib/ai-insights/types";

/**
 * The minimal contract the analysis flow needs from an LLM: return a raw
 * object for the given system + user prompt. Injectable so unit tests can
 * feed canned (valid or malformed) model output without a network call.
 */
export type GenerateStructuredFn = (input: {
  system: string;
  prompt: string;
}) => Promise<{ object: unknown }>;

/**
 * Default generator: Vercel AI SDK `generateText` with `Output.object`.
 * The SDK parses and validates the JSON against the schema; we re-validate
 * in `analyzeDailyFeedback` so the app never trusts the provider implicitly.
 */
export async function defaultGenerateStructured({
  system,
  prompt,
}: {
  system: string;
  prompt: string;
}): Promise<{ object: unknown }> {
  const model = createModel(); // throws AiNotConfiguredError when misconfigured
  const startedAt = Date.now();

  try {
    const result = await generateText({
      model,
      system,
      prompt,
      timeout: getGenerationTimeoutMs(),
      output: Output.object({
        schema: dailyAIInsightSchema,
        name: "dailyAIInsight",
        description:
          "Structured AI analysis of today's patient feedback for clinic management.",
      }),
    });

    const durationMs = Date.now() - startedAt;
    console.log(
      `[ai-insights] Analysis succeeded in ${durationMs}ms (model: ${getModelName()}, prompt: ${DAILY_ANALYSIS_PROMPT_VERSION})`,
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

  let raw: unknown;
  try {
    const result = await generate({
      system: DAILY_ANALYSIS_SYSTEM_PROMPT,
      prompt,
    });
    raw = result.object;
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiProviderError("The AI provider call failed.", { cause: error });
  }

  const parsed = dailyAIInsightSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      "[ai-insights] AI output failed schema validation — result discarded",
      parsed.error.flatten(),
    );
    throw new AiValidationError(
      "The AI returned output that did not match the required schema.",
    );
  }

  return parsed.data;
}
