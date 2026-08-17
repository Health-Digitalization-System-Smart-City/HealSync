// AI assistant service (Phase 2 — "Ask AI about your clinic").
//
// Answers natural-language questions by letting the LLM call the seven
// predefined tools (getClinicSummary, getBranchPerformance, …). The LLM never
// accesses the database directly and never calculates statistics the tools can
// provide (PRD §15–§18, §24). The final answer is schema-validated, and
// `sources` are attached server-side from the tools actually executed.
//
// Injectable `generate` + `analytics` make the flow unit-testable without a
// network call or database.

import { generateText, Output } from "ai";
import { isStepCount } from "ai";

import { AiError, AiProviderError, AiValidationError } from "./errors";
import { getGenerationTimeoutMs, getModelName } from "./model";
import { createModel } from "./provider";
import {
  aiAssistantResponseSchema,
  type AiAssistantResult,
  type AiAssistantResponse,
  type AssistantSource,
} from "./schema";
import {
  AI_ASSISTANT_PROMPT_VERSION,
  AI_ASSISTANT_SYSTEM_PROMPT,
  buildAssistantUserPrompt,
} from "./prompts/ai-assistant";
import {
  createInsightTools,
  createToolCallRecorder,
  dedupeToolRecords,
  type AnalyticsPort,
} from "./tools";

export type AssistantQuestionInput = {
  question: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
};

export type AssistantGenerateFn = (input: {
  system: string;
  prompt: string;
  tools: ReturnType<typeof createInsightTools>;
}) => Promise<{ object: unknown }>;

/**
 * Default generator: Vercel AI SDK `generateText` with the tool set and a
 * structured-output schema. Multi-step (`isStepCount`) lets the model call
 * several tools before producing its final answer.
 */
export async function defaultAssistantGenerate({
  system,
  prompt,
  tools,
}: {
  system: string;
  prompt: string;
  tools: ReturnType<typeof createInsightTools>;
}): Promise<{ object: unknown }> {
  const model = createModel();
  const startedAt = Date.now();

  try {
    const result = await generateText({
      model,
      system,
      prompt,
      tools,
      stopWhen: isStepCount(6),
      timeout: getGenerationTimeoutMs(),
      output: Output.object({
        schema: aiAssistantResponseSchema,
        name: "aiAssistantResponse",
        description:
          "Structured answer to a clinic question, based on the fetched analytics.",
      }),
    });

    const durationMs = Date.now() - startedAt;
    console.log(
      `[ai-insights] Assistant answered in ${durationMs}ms (model: ${getModelName()}, prompt: ${AI_ASSISTANT_PROMPT_VERSION})`,
    );

    return { object: result.output };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    if (error instanceof AiError) throw error;
    console.error(
      `[ai-insights] Assistant provider call failed after ${durationMs}ms (model: ${getModelName()})`,
      error,
    );
    throw new AiProviderError("The AI provider call failed.", { cause: error });
  }
}

export type AssistantDeps = {
  analytics: AnalyticsPort;
  generate?: AssistantGenerateFn;
};

/**
 * Answers a clinic question using the predefined tools.
 *
 * Throws `AiError` subclasses on failure (provider / validation). Sources are
 * derived from the tools actually executed during the call.
 */
export async function askAiInsightsQuestion(
  input: AssistantQuestionInput,
  deps: AssistantDeps,
): Promise<AiAssistantResult> {
  const generate = deps.generate ?? defaultAssistantGenerate;
  const recorder = createToolCallRecorder();
  const tools = createInsightTools(deps.analytics, recorder.record);

  console.log(
    `[ai-insights] Assistant question received (model: ${getModelName()})`,
  );

  let raw: unknown;
  try {
    const result = await generate({
      system: AI_ASSISTANT_SYSTEM_PROMPT,
      prompt: buildAssistantUserPrompt(input),
      tools,
    });
    raw = result.object;
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiProviderError("The AI provider call failed.", { cause: error });
  }

  const parsed = aiAssistantResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      "[ai-insights] Assistant output failed schema validation — result discarded",
      parsed.error.flatten(),
    );
    throw new AiValidationError(
      "The AI returned output that did not match the required schema.",
    );
  }

  const sources: AssistantSource[] = dedupeToolRecords(recorder.records).map(
    (record) => ({
      tool: record.tool,
      description: record.description,
    }),
  );

  return { ...(parsed.data as AiAssistantResponse), sources };
}
