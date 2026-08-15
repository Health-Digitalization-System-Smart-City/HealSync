// AI provider factory (ROADMAP 7.1 — "swappable provider interface").
//
// This is the ONLY module that instantiates a provider-specific SDK client.
// The rest of the application works against the Vercel AI SDK's generic
// `LanguageModel` interface, so changing the provider (Gemini → another
// provider) is a change to this file + `model.ts` + environment config.

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

import { AiNotConfiguredError } from "./errors";
import { getModelConfig } from "./model";

/**
 * Creates the AI SDK language model for the configured provider.
 *
 * Throws `AiNotConfiguredError` when the provider is unsupported or no API
 * key is configured, so callers can surface a graceful "unavailable" state.
 */
export function createModel(): LanguageModel {
  const { provider, modelId, apiKey } = getModelConfig();

  if (!apiKey) {
    throw new AiNotConfiguredError(
      "AI_API_KEY is not set. Set AI_API_KEY (and AI_PROVIDER / AI_MODEL) to enable AI Insights.",
    );
  }

  switch (provider) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }
    default: {
      // Unreachable: getModelConfig already rejects unknown providers.
      const never: never = provider;
      throw new Error(`Unsupported AI provider: ${String(never)}`);
    }
  }
}
