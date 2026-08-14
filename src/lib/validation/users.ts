import { z } from "zod";

/**
 * Fixed role set (security.md §2). The system does not support custom roles;
 * roleId must reference one of these roles (API.md §14).
 */
export const FIXED_ROLE_NAMES = ["Admin", "Manager", "Analyst"] as const;

export type FixedRoleName = (typeof FIXED_ROLE_NAMES)[number];

export const createUserSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
  name: z.string().trim().min(1, "Name is required.").max(100).optional(),
  roleId: z.string().min(1, "Please select a role."),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  userId: z.string().min(1, "User is required."),
  name: z.string().trim().min(1, "Name is required.").max(100).optional(),
  roleId: z.string().min(1, "Please select a role.").optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const disableUserSchema = z.object({
  userId: z.string().min(1, "User is required."),
});

export type DisableUserInput = z.infer<typeof disableUserSchema>;
