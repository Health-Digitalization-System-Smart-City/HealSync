// Rate limiting for the Ask AI feature (Phase 2, PRD §31).
//
// A simple per-user sliding-window limiter. Server-side, in-memory — adequate
// for a single-instance deployment (the app's current target); a distributed
// store can replace this later without changing callers. Limits are read from
// environment config with sane defaults.

export const DEFAULT_ASK_AI_WINDOW_MS = 60_000;
export const DEFAULT_ASK_AI_MAX_REQUESTS = 10;
export const DEFAULT_ASK_AI_MAX_LENGTH = 500;

/** Reads the per-minute request budget for Ask AI from the environment. */
export function getAskAiRateLimit(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): { windowMs: number; max: number } {
  const raw = Number(env.AI_ASK_MAX_REQUESTS_PER_MINUTE);
  const max =
    Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_ASK_AI_MAX_REQUESTS;
  return { windowMs: DEFAULT_ASK_AI_WINDOW_MS, max };
}

/** Reads the maximum question length (characters) from the environment. */
export function getAskAiMaxLength(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): number {
  const raw = Number(env.AI_ASK_MAX_LENGTH);
  return Number.isFinite(raw) && raw > 0
    ? Math.floor(raw)
    : DEFAULT_ASK_AI_MAX_LENGTH;
}

export interface RateLimiter {
  /** Returns true when `key` is within budget; false when limited. */
  allow(key: string): boolean;
}

/**
 * Sliding-window limiter: tracks timestamps per key and allows at most `max`
 * calls within `windowMs`. Timestamps are pruned on access, so memory stays
 * bounded by active traffic.
 */
export function createSlidingWindowLimiter(
  windowMs: number,
  max: number,
  now: () => number = () => Date.now(),
): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    allow(key: string): boolean {
      const current = now();
      const windowStart = current - windowMs;
      const timestamps = (hits.get(key) ?? []).filter(
        (ts) => ts > windowStart,
      );

      if (timestamps.length >= max) {
        hits.set(key, timestamps);
        return false;
      }

      timestamps.push(current);
      hits.set(key, timestamps);
      return true;
    },
  };
}

/**
 * Production limiter for Ask AI, keyed per user. A module-level instance is
 * shared across requests (that is the point — a per-process budget).
 */
export const askAiRateLimiter: RateLimiter = createSlidingWindowLimiter(
  DEFAULT_ASK_AI_WINDOW_MS,
  DEFAULT_ASK_AI_MAX_REQUESTS,
);
