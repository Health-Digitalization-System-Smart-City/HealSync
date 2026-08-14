import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, "Service name is required").max(120),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .default(""),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = z.object({
  id: z.string().min(1, "Service is required"),
  name: z.string().trim().min(1, "Service name is required").max(120),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .default(""),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

/** Soft delete: `isActive: false` stops the service being offered. */
export const setServiceActiveSchema = z.object({
  id: z.string().min(1, "Service is required"),
  isActive: z.boolean(),
});

export type SetServiceActiveInput = z.infer<typeof setServiceActiveSchema>;
