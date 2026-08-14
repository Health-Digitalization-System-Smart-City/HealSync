// Date range model for feedback filtering (`docs/API.md` §16).
//
// The client sends a `range` preset (and optional explicit dates for
// "custom"). The server resolves the exact date boundaries using the
// application's local timezone; clients never compute authoritative
// boundaries.

import { validationError } from "./errors";
import type { FeedbackRange } from "./types";

export const RANGE_VALUES = [
  "all",
  "today",
  "yesterday",
  "this_week",
  "last_7_days",
  "this_month",
  "last_30_days",
  "this_year",
  "custom",
] as const satisfies readonly FeedbackRange[];

export const RANGE_OPTIONS: ReadonlyArray<{
  value: FeedbackRange;
  label: string;
}> = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "this_month", label: "This month" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

export type ResolvedRange = { start: Date; end: Date } | null;

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

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Parses a `YYYY-MM-DD` string as a local calendar date. */
function parseDateOnly(value: string): Date {
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

export function resolveDateRange(
  range: FeedbackRange | undefined,
  startDate?: string,
  endDate?: string,
  now: Date = new Date(),
): ResolvedRange {
  switch (range) {
    case undefined:
    case "all":
      return null;
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "yesterday": {
      const day = addDays(now, -1);
      return { start: startOfDay(day), end: endOfDay(day) };
    }
    case "this_week": {
      const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
      const startOfWeek = addDays(startOfDay(now), -dayOfWeek);
      return { start: startOfWeek, end: endOfDay(now) };
    }
    case "last_7_days":
      return { start: startOfDay(addDays(now, -7)), end: endOfDay(now) };
    case "this_month":
      return { start: startOfMonth(now), end: endOfDay(now) };
    case "last_30_days":
      return { start: startOfDay(addDays(now, -30)), end: endOfDay(now) };
    case "this_year":
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfDay(now) };
    case "custom": {
      const start = startDate ? parseDateOnly(startDate) : undefined;
      const end = endDate ? parseDateOnly(endDate) : undefined;
      if (!start || !end) {
        throw validationError(
          "A custom range requires both a start and an end date.",
        );
      }
      if (start.getTime() > end.getTime()) {
        throw validationError("The start date must not be after the end date.");
      }
      return { start: startOfDay(start), end: endOfDay(end) };
    }
  }
}

/** Local `YYYY-MM-DD` string for a date input's default value. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
