import { z } from "zod";
import { RANGE_VALUES } from "@/lib/feedback/ranges";

export const analyticsQuerySchema = z.object({
  range: z.enum(RANGE_VALUES).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  branchId: z.string().min(1).optional(),
  serviceId: z.string().min(1).optional(),
  interval: z.enum(["day", "week", "month"]).optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
