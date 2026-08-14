import { z } from "zod";

/** Controlled task category values (matches the dashboard UI). */
export const TASK_CATEGORIES = [
  "Follow-up",
  "Inspection",
  "Equipment",
  "Protocol",
  "Staffing",
] as const;

export const TASK_PRIORITIES = ["urgent", "high", "medium", "low"] as const;

export const TASK_STATUSES = ["pending", "in_progress", "completed"] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200),
  description: z.string().trim().max(1000).optional().default(""),
  branchId: z.string().min(1, "Select a clinic branch").optional(),
  category: z.enum(TASK_CATEGORIES).default("Follow-up"),
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  dueDate: z.string().trim().max(120).optional().default(""),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(TASK_STATUSES),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
