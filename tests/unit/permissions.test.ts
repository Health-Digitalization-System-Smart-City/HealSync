import { describe, expect, it } from "vitest";

import {
  ALL_PERMISSIONS,
  isPermissionGranted,
  type PermissionName,
} from "@/lib/auth/permissions";

describe("ALL_PERMISSIONS", () => {
  it("contains exactly the 17 permissions from API.md §8 / security.md §3", () => {
    const expected = [
      "analytics.read",
      "analytics.ai",
      "feedback.read",
      "feedback.update",
      "feedback.delete",
      "branch.read",
      "branch.create",
      "branch.update",
      "branch.delete",
      "service.read",
      "service.create",
      "service.update",
      "service.delete",
      "user.read",
      "user.create",
      "user.update",
      "user.disable",
    ];

    expect(new Set(ALL_PERMISSIONS)).toEqual(new Set(expected));
    expect(ALL_PERMISSIONS).toHaveLength(17);
  });

  it("uses the resource.action convention for every permission", () => {
    for (const permission of ALL_PERMISSIONS) {
      expect(permission).toMatch(/^[a-z]+\.[a-z]+$/);
    }
  });

  it("is a const tuple so every name is a literal type", () => {
    const typed: PermissionName = "user.disable";
    expect(typed).toBe("user.disable");
  });
});

describe("isPermissionGranted", () => {
  it("grants when the permission is in the set", () => {
    expect(
      isPermissionGranted(
        ["analytics.read", "feedback.read"],
        "analytics.read",
      ),
    ).toBe(true);
  });

  it("denies when the permission is missing", () => {
    expect(isPermissionGranted(["analytics.read"], "feedback.delete")).toBe(
      false,
    );
  });

  it("denies for an empty permission set", () => {
    expect(isPermissionGranted([], "user.create")).toBe(false);
  });
});
