// Time-period resolution for the AI Insights page (Phase 2).
//
// Pure module — no database access. Resolves a period preset (Today / Last 7
// Days / Last 30 Days / Last 12 Months / Custom) into exact start/end
// boundaries plus the immediately preceding period of equal length, so the
// analytics layer can compute period comparisons (PRD §22). Boundaries use
// the server's local calendar, matching `resolveDateRange` in
// `src/lib/feedback/ranges.ts`.

import { validationError } from "@/lib/feedback/errors";

export const INSIGHT_PERIODS = [
  "today",
  "7_days",
  "30_days",
  "12_months",
  "custom",
] as const;

export type InsightPeriod = (typeof INSIGHT_PERIODS)[number];

export type InsightPeriodInput = {
  period: InsightPeriod;
  /** YYYY-MM-DD, required when period === "custom". */
  startDate?: string;
  endDate?: string;
};

export type ResolvedPeriod = {
  period: InsightPeriod;
  start: Date;
  end: Date;
  /** The period of equal length immediately before `start`. */
  previousStart: Date;
  previousEnd: Date;
  label: string;
  previousLabel: string;
};

export const PERIOD_LABELS: Record<InsightPeriod, string> = {
  today: "Today",
  "7_days": "Last 7 Days",
  "30_days": "Last 30 Days",
  "12_months": "Last 12 Months",
  custom: "Custom Range",
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Parses a YYYY-MM-DD string as a local calendar date (mirrors ranges.ts). */
export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw validationError("Dates must use the YYYY-MM-DD format.");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw validationError("Dates must use the YYYY-MM-DD format.");
  }
  return new Date(year, month - 1, day);
}

export function isInsightPeriod(value: unknown): value is InsightPeriod {
  return (
    typeof value === "string" &&
    (INSIGHT_PERIODS as readonly string[]).includes(value)
  );
}

function formatRange(start: Date, end: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).formatRange(start, end);
}

/** Equal-length previous period: the window immediately before `start`. */
export function previousPeriodOfEqualLength(
  start: Date,
  end: Date,
): { previousStart: Date; previousEnd: Date } {
  const lengthMs = end.getTime() - start.getTime() + 1;
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - lengthMs + 1);
  return { previousStart, previousEnd };
}

/**
 * Resolves a period input into exact boundaries + previous period.
 *
 * Throws `validationError` (the app's standard input error, API.md §9) for
 * invalid custom ranges. Never trusts client-computed boundaries.
 */
export function resolveInsightPeriod(
  input: InsightPeriodInput,
  now: Date = new Date(),
): ResolvedPeriod {
  const period = input.period;

  let start: Date;
  let end: Date;

  switch (period) {
    case "today":
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case "7_days":
      start = startOfDay(addDays(now, -6));
      end = endOfDay(now);
      break;
    case "30_days":
      start = startOfDay(addDays(now, -29));
      end = endOfDay(now);
      break;
    case "12_months": {
      const startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      start = startOfDay(startDate);
      end = endOfDay(now);
      break;
    }
    case "custom": {
      const customStart = input.startDate
        ? parseDateOnly(input.startDate)
        : undefined;
      const customEnd = input.endDate
        ? parseDateOnly(input.endDate)
        : undefined;
      if (!customStart || !customEnd) {
        throw validationError(
          "A custom range requires both a start and an end date.",
        );
      }
      if (customStart.getTime() > customEnd.getTime()) {
        throw validationError("The start date must not be after the end date.");
      }
      start = startOfDay(customStart);
      end = endOfDay(customEnd);
      break;
    }
  }

  const { previousStart, previousEnd } = previousPeriodOfEqualLength(
    start,
    end,
  );

  const label =
    period === "custom" ? formatRange(start, end) : PERIOD_LABELS[period];
  const previousLabel =
    period === "today"
      ? "Yesterday"
      : period === "custom"
        ? formatRange(previousStart, previousEnd)
        : `Previous ${PERIOD_LABELS[period].replace("Last ", "")}`;

  return {
    period,
    start,
    end,
    previousStart,
    previousEnd,
    label,
    previousLabel,
  };
}
