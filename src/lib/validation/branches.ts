import { z } from "zod";

const branchNameSchema = z
  .string()
  .trim()
  .min(1, "Branch name is required")
  .max(120, "Branch name is too long");

/** Optional short code like "BR-01". Empty string becomes null in the DB. */
const branchCodeSchema = z
  .string()
  .trim()
  .max(20, "Code is too long")
  .regex(/^[A-Za-z0-9-]*$/, "Use letters, numbers, or dashes only")
  .optional()
  .default("");

export const createBranchSchema = z.object({
  name: branchNameSchema,
  code: branchCodeSchema,
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = z.object({
  id: z.string().min(1, "Branch is required"),
  name: branchNameSchema,
  code: branchCodeSchema,
});

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;

/** Soft delete: `isActive: false` shuts a branch down (keeps history). */
export const setBranchActiveSchema = z.object({
  id: z.string().min(1, "Branch is required"),
  isActive: z.boolean(),
});

export type SetBranchActiveInput = z.infer<typeof setBranchActiveSchema>;

/** Replaces the set of services a branch currently offers. */
export const setBranchServicesSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  serviceIds: z.array(z.string().min(1)).max(200),
});

export type SetBranchServicesInput = z.infer<typeof setBranchServicesSchema>;
