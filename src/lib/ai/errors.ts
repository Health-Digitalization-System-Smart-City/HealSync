// Typed AI errors (API.md §10 "AI_ERROR").
//
// The AI service throws these; callers map them to a predictable
// ActionResponse so the dashboard never crashes because of the AI feature.

export class AiError extends Error {
  readonly code = "AI_ERROR" as const;
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AiError";
  }
}

/** The provider/model is not configured (e.g. missing AI_API_KEY). */
export class AiNotConfiguredError extends AiError {
  constructor(message = "AI provider is not configured.") {
    super(message);
    this.name = "AiNotConfiguredError";
  }
}

/** The model returned output that failed schema validation. */
export class AiValidationError extends AiError {
  constructor(
    message = "AI returned malformed output that failed validation.",
  ) {
    super(message);
    this.name = "AiValidationError";
  }
}

/** Any failure during the model call (network, provider, quota, ...). */
export class AiProviderError extends AiError {
  constructor(
    message = "The AI provider call failed.",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AiProviderError";
  }
}
