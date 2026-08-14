"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const candidates = new Set([
    1,
    2,
    current - 1,
    current,
    current + 1,
    total - 1,
    total,
  ]);
  const sorted = [...candidates]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const window: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) window.push("ellipsis");
    window.push(page);
    previous = page;
  }
  return window;
}

export function FeedbackPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4.5 py-3 sm:flex-row sm:items-center">
      <p className="text-xs text-slate-500 font-medium">
        Showing <span className="font-semibold text-slate-800">{start}–{end}</span>{" "}
        of <span className="font-semibold text-slate-800">{total.toLocaleString()}</span>{" "}
        records
      </p>

      <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
        <label className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={disabled}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            aria-label="First page"
            title="First page"
            onClick={() => onPageChange(1)}
            disabled={disabled || page <= 1}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsLeft className="size-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            aria-label="Previous page"
            title="Previous page"
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || page <= 1}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          {/* Page numbers with windowing */}
          {pageWindow(page, totalPages).map((value, index) =>
            value === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-xs font-bold text-slate-400"
              >
                …
              </span>
            ) : (
              <button
                key={value}
                type="button"
                onClick={() => onPageChange(value)}
                disabled={disabled}
                aria-current={value === page ? "page" : undefined}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-lg text-xs font-semibold shadow-xs transition",
                  value === page
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  disabled && "opacity-60",
                )}
              >
                {value}
              </button>
            ),
          )}

          {/* Next Page */}
          <button
            type="button"
            aria-label="Next page"
            title="Next page"
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || page >= totalPages}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            aria-label="Last page"
            title="Last page"
            onClick={() => onPageChange(totalPages)}
            disabled={disabled || page >= totalPages}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
