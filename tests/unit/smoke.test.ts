// Smoke test — proves the unit-test toolchain, TypeScript path aliases,
// and a foundational utility all work together. Product-level tests will be
// added in later phases.
import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, 0, "b")).toBe("a b");
  });
});
