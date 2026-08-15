// AI model configuration (ROADMAP 7.1 — "swappable provider interface").
//
// This module is the ONLY place that reads the AI provider/model environment
// variables. Keeping the model config isolated means switching providers
// (e.g. Gemini → another provider) later only touches this file (+ the
// provider factory) and the environment — never the rest of the application.

import { AiNotConfiguredError } from "./errors";

export type AIProvider = "google";

export type ModelConfig = {
  provider: AIProvider;
  modelId: string;
  apiKey: string;
};

/** Free-tier Gemini model used for development (configurable via AI_MODEL). */
export const DEFAULT_MODEL = "gemini-2.5-flash";

export const DEFAULT_PROVIDER: AIProvider = "google";

/** Max time (ms) a single structured generation may take. */
export const DEFAULT_TIMEOUT_MS = 60_000;

export function getModelConfig(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): ModelConfig {
  const rawProvider =
    (env.AI_PROVIDER ?? "").trim().toLowerCase() || DEFAULT_PROVIDER;
  if (rawProvider !== "google") {
    throw new AiNotConfiguredError(
      `Unsupported AI_PROVIDER "${rawProvider}". Supported: google.`,
    );
  }

  const provider: AIProvider = "google";
  const modelId = (env.AI_MODEL ?? "").trim() || DEFAULT_MODEL;
  const apiKey = (env.AI_API_KEY ?? "").trim();

  return { provider, modelId, apiKey };
}

/** True when the AI provider is fully configured (an API key is present). */
export function isAIConfigured(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): boolean {
  try {
    return getModelConfig(env).apiKey.length > 0;
  } catch {
    return false;
  }
}

/** Human-readable model identifier for logs and persistence, e.g. "google/gemini-2.5-flash". */
export function getModelName(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): string {
  const { provider, modelId } = getModelConfig(env);
  return `${provider}/${modelId}`;
}

/** Timeout for a single generation call, in milliseconds. */
export function getGenerationTimeoutMs(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): number {
  const raw = Number(env.AI_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
}
