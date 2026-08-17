import { describe, expect, it } from "vitest";

import {
  createSlidingWindowLimiter,
  getAskAiMaxLength,
  getAskAiRateLimit,
} from "@/lib/ai/rate-limit";

describe("createSlidingWindowLimiter", () => {
  it("allows requests up to the per-window budget", () => {
    const now = { value: 0 };
    const limiter = createSlidingWindowLimiter(60_000, 3, () => now.value);

    expect(limiter.allow("user-1")).toBe(true);
    expect(limiter.allow("user-1")).toBe(true);
    expect(limiter.allow("user-1")).toBe(true);
    expect(limiter.allow("user-1")).toBe(false);
  });

  it("tracks users independently", () => {
    const now = { value: 0 };
    const limiter = createSlidingWindowLimiter(60_000, 1, () => now.value);

    expect(limiter.allow("user-a")).toBe(true);
    expect(limiter.allow("user-a")).toBe(false);
    expect(limiter.allow("user-b")).toBe(true);
  });

  it("resets after the window elapses", () => {
    const now = { value: 0 };
    const limiter = createSlidingWindowLimiter(60_000, 2, () => now.value);

    expect(limiter.allow("user-1")).toBe(true);
    expect(limiter.allow("user-1")).toBe(true);
    expect(limiter.allow("user-1")).toBe(false);

    now.value = 61_000;
    expect(limiter.allow("user-1")).toBe(true);
  });
});

describe("config helpers", () => {
  it("defaults to 10 requests per minute and a 500-char question", () => {
    expect(getAskAiRateLimit({})).toEqual({
      windowMs: 60_000,
      max: 10,
    });
    expect(getAskAiMaxLength({})).toBe(500);
  });

  it("reads overrides from the environment", () => {
    expect(
      getAskAiRateLimit({ AI_ASK_MAX_REQUESTS_PER_MINUTE: "25" }).max,
    ).toBe(25);
    expect(getAskAiMaxLength({ AI_ASK_MAX_LENGTH: "1200" })).toBe(1200);
  });

  it("ignores invalid environment values", () => {
    expect(getAskAiRateLimit({ AI_ASK_MAX_REQUESTS_PER_MINUTE: "abc" }).max).toBe(
      10,
    );
    expect(getAskAiMaxLength({ AI_ASK_MAX_LENGTH: "-5" })).toBe(500);
  });
});
