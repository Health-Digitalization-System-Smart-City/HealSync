import { describe, expect, it } from "vitest";

import {
  createUserSchema,
  disableUserSchema,
  updateUserSchema,
  FIXED_ROLE_NAMES,
} from "@/lib/validation/users";

describe("createUserSchema", () => {
  it("accepts valid input", () => {
    const result = createUserSchema.safeParse({
      email: "manager@healsync.com",
      password: "StrongPass1",
      name: "Sara Ahmed",
      roleId: "role-1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts input without a name (derived from email server-side)", () => {
    const result = createUserSchema.safeParse({
      email: "analyst@healsync.com",
      password: "StrongPass1",
      roleId: "role-2",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid emails", () => {
    const result = createUserSchema.safeParse({
      email: "not-an-email",
      password: "StrongPass1",
      roleId: "role-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = createUserSchema.safeParse({
      email: "user@healsync.com",
      password: "short",
      roleId: "role-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing roleId", () => {
    const result = createUserSchema.safeParse({
      email: "user@healsync.com",
      password: "StrongPass1",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("accepts a role-only update", () => {
    expect(
      updateUserSchema.safeParse({ userId: "u-1", roleId: "role-3" }).success,
    ).toBe(true);
  });

  it("accepts a name-only update", () => {
    expect(
      updateUserSchema.safeParse({ userId: "u-1", name: "New Name" }).success,
    ).toBe(true);
  });

  it("rejects an empty name when provided", () => {
    expect(
      updateUserSchema.safeParse({ userId: "u-1", name: "  " }).success,
    ).toBe(false);
  });

  it("rejects a missing userId", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(false);
  });
});

describe("disableUserSchema", () => {
  it("accepts a valid userId", () => {
    expect(disableUserSchema.safeParse({ userId: "u-1" }).success).toBe(true);
  });

  it("rejects a missing userId", () => {
    expect(disableUserSchema.safeParse({}).success).toBe(false);
  });
});

describe("FIXED_ROLE_NAMES", () => {
  it("contains exactly the three fixed roles from security.md §2", () => {
    expect([...FIXED_ROLE_NAMES].sort()).toEqual([
      "Admin",
      "Analyst",
      "Manager",
    ]);
  });
});
