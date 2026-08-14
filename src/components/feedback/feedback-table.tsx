"use client";

import {
  Building2,
  Eye,
  Lock,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { formatDate } from "./format";
import { RatingStars } from "./rating-stars";
import type { FeedbackView, ViewerCapabilities } from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

const iconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50";

type SentimentTone = "positive" | "neutral" | "needsAttention";

function getSentimentTone(score: number): SentimentTone {
  if (score >= 5) return "positive";
  if (score >= 3) return "neutral";
  return "needsAttention";
}

const TONE_BADGES: Record<
  SentimentTone,
  { label: string; className: string }
> = {
  positive: {
    label: "Positive",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  neutral: {
    label: "Neutral",
    className: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  needsAttention: {
    label: "Needs attention",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

export function FeedbackTable({
  items,
  capabilities,
  onSelect,
  onEdit,
  onDelete,
  loading = false,
}: {
  items: FeedbackView[];
  capabilities: ViewerCapabilities;
  onSelect: (item: FeedbackView) => void;
  onEdit?: (item: FeedbackView) => void;
  onDelete: (item: FeedbackView) => void;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto transition-opacity",
        loading && "opacity-60",
      )}
    >
      <table className="w-full min-w-[950px] text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="px-4.5 py-3.5">Patient Contact</th>
            <th className="px-4.5 py-3.5">Branch</th>
            <th className="px-4.5 py-3.5">Service</th>
            <th className="px-4.5 py-3.5">Rating & Status</th>
            <th className="px-4.5 py-3.5">Patient Comment</th>
            <th className="px-4.5 py-3.5">Submitted</th>
            <th className="px-4.5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {items.map((item) => {
            const tone = getSentimentTone(item.ratingScore);
            const badge = TONE_BADGES[tone];

            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className="group cursor-pointer transition-colors hover:bg-slate-50/80"
              >
                {/* Contact Column (Server-side phone privacy applied) */}
                <td className="px-4.5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        capabilities.canSeePhone
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200",
                      )}
                    >
                      <Phone className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold tracking-tight text-slate-800">
                        {item.phoneNumber || "No phone"}
                      </p>
                      {!capabilities.canSeePhone ? (
                        <p className="flex items-center gap-1 text-[11px] text-slate-400 font-sans">
                          <Lock className="size-3 text-slate-400" />
                          Masked ({capabilities.role})
                        </p>
                      ) : (
                        <p className="text-[11px] text-blue-600/80 font-sans font-medium">
                          Verified Patient
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Branch */}
                <td className="px-4.5 py-3.5">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Building2 className="size-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.branchName}</span>
                  </div>
                </td>

                {/* Service */}
                <td className="px-4.5 py-3.5">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Stethoscope className="size-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.serviceName}</span>
                  </div>
                </td>

                {/* Rating */}
                <td className="px-4.5 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5">
                      <RatingStars score={item.ratingScore} />
                      <span className="text-xs font-semibold text-slate-600">
                        {item.ratingScore}/7
                      </span>
                    </div>
                    <span
                      className={cn(
                        "inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none",
                        badge.className,
                      )}
                    >
                      {item.ratingLabel}
                    </span>
                  </div>
                </td>

                {/* Comment */}
                <td className="px-4.5 py-3.5">
                  {item.comment ? (
                    <p
                      className="max-w-[260px] truncate text-slate-600 text-sm"
                      title={item.comment}
                    >
                      {item.comment}
                    </p>
                  ) : (
                    <span className="text-xs italic text-slate-400">
                      No written feedback
                    </span>
                  )}
                </td>

                {/* Submitted */}
                <td className="whitespace-nowrap px-4.5 py-3.5 text-xs text-slate-500 font-medium">
                  {formatDate(item.createdAt)}
                </td>

                {/* Actions */}
                <td className="whitespace-nowrap px-4.5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View details */}
                    <button
                      type="button"
                      aria-label="View feedback details"
                      title="View details"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(item);
                      }}
                      className={iconButtonClass}
                    >
                      <Eye className="size-4" />
                    </button>

                    {/* Edit button (only if permitted) */}
                    {capabilities.canUpdate && onEdit && (
                      <button
                        type="button"
                        aria-label="Edit feedback"
                        title="Edit feedback"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(item);
                        }}
                        className={cn(
                          iconButtonClass,
                          "hover:bg-blue-50 hover:text-blue-600",
                        )}
                      >
                        <Pencil className="size-4" />
                      </button>
                    )}

                    {/* Delete button (only if permitted) */}
                    {capabilities.canDelete && (
                      <button
                        type="button"
                        aria-label="Delete feedback"
                        title="Delete feedback"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(item);
                        }}
                        className={cn(
                          iconButtonClass,
                          "hover:bg-red-50 hover:text-red-600",
                        )}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
