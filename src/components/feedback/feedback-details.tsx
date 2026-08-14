"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Check,
  Copy,
  Loader2,
  Lock,
  MessageSquare,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { RATING_OPTIONS, getRatingScore } from "@/lib/feedback/ratings";
import type {
  FeedbackRating,
  FeedbackView,
  UpdateFeedbackInput,
  ViewerCapabilities,
} from "@/lib/feedback/types";
import { cn } from "@/lib/utils";
import { formatDateTime } from "./format";
import { RatingStars } from "./rating-stars";

type Tone = "positive" | "neutral" | "needsAttention";

function toneOf(ratingScore: number): Tone {
  if (ratingScore >= 5) return "positive";
  if (ratingScore >= 3) return "neutral";
  return "needsAttention";
}

const TONE_STYLES: Record<
  Tone,
  { label: string; className: string; bg: string }
> = {
  positive: {
    label: "Positive Sentiment",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    bg: "bg-emerald-500",
  },
  neutral: {
    label: "Neutral Sentiment",
    className: "border-slate-200 bg-slate-100 text-slate-700",
    bg: "bg-slate-500",
  },
  needsAttention: {
    label: "Needs Attention",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    bg: "bg-amber-500",
  },
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-xs transition focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20";

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3.5 last:border-b-0">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="mt-1 text-sm text-slate-800">{children}</div>
      </div>
    </div>
  );
}

export function FeedbackDetails({
  feedback,
  capabilities,
  initialEditing = false,
  onClose,
  onSave,
  onDelete,
}: {
  feedback: FeedbackView;
  capabilities: ViewerCapabilities;
  initialEditing?: boolean;
  onClose: () => void;
  onSave: (input: UpdateFeedbackInput) => Promise<FeedbackView>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(initialEditing && capabilities.canUpdate);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [rating, setRating] = useState<FeedbackRating>(feedback.rating);
  const [comment, setComment] = useState(feedback.comment ?? "");

  const tone = TONE_STYLES[toneOf(feedback.ratingScore)];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!busy) onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, busy]);

  function handleCopyId() {
    navigator.clipboard.writeText(feedback.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      const input: UpdateFeedbackInput = {};
      if (rating !== feedback.rating) input.rating = rating;
      if (comment !== (feedback.comment ?? "")) input.comment = comment;
      if (Object.keys(input).length === 0) {
        setEditing(false);
        return;
      }
      await onSave(input);
      setEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save feedback changes. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await onDelete(feedback.id);
    } catch (deleteError) {
      setBusy(false);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete feedback record. Please try again.",
      );
    }
  }

  const canManage = capabilities.canUpdate || capabilities.canDelete;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Feedback details drawer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={busy ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Slide-over Container */}
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Feedback Details
                </h2>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy Feedback ID"
                  className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600 hover:bg-slate-200"
                >
                  {feedback.id}
                  {copied ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Logged patient experience record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold",
                tone.className,
              )}
            >
              {tone.label}
            </span>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close drawer"
              className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">Action Failed</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {editing ? (
            /* Edit Mode */
            <div className="space-y-4.5">
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-800">
                <p className="font-semibold flex items-center gap-1.5">
                  <Pencil className="size-3.5" />
                  Editing Feedback Record
                </p>
                <p className="mt-1 text-blue-700">
                  Update the rating or clarify written patient feedback. Changes are auditable.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Rating Scale
                </label>
                <select
                  value={rating}
                  onChange={(event) =>
                    setRating(event.target.value as FeedbackRating)
                  }
                  className={inputClass}
                >
                  {RATING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.score}/7)
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <RatingStars score={getRatingScore(rating)} />
                  <span className="text-xs text-slate-500">
                    Score: {getRatingScore(rating)} of 7
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Patient Written Feedback
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="Enter patient feedback notes..."
                  className={cn(inputClass, "resize-none leading-relaxed")}
                />
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Up to 1,000 characters</span>
                  <span>{comment.length}/1000</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                    setRating(feedback.rating);
                    setComment(feedback.comment ?? "");
                  }}
                  disabled={busy}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={busy}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save changes
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              {/* Rating Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Satisfaction Score
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RatingStars score={feedback.ratingScore} showValue />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {feedback.ratingLabel}
                  </span>
                </div>
              </div>

              {/* Detail Items */}
              <div className="rounded-xl border border-slate-200/80 bg-white px-4">
                <DetailRow
                  icon={<CalendarDays className="size-4" />}
                  label="Date & Time of Submission"
                >
                  <span className="font-medium text-slate-700">
                    {formatDateTime(feedback.createdAt)}
                  </span>
                </DetailRow>

                <DetailRow
                  icon={<Building2 className="size-4" />}
                  label="Healthcare Branch"
                >
                  <span className="font-semibold text-slate-800">
                    {feedback.branchName}
                  </span>
                </DetailRow>

                <DetailRow
                  icon={<Stethoscope className="size-4" />}
                  label="Clinical Service Received"
                >
                  <span className="font-semibold text-slate-800">
                    {feedback.serviceName}
                  </span>
                </DetailRow>

                <DetailRow
                  icon={<Phone className="size-4" />}
                  label="Patient Phone / Contact"
                >
                  {capabilities.canSeePhone ? (
                    <div>
                      <span className="font-mono font-bold text-slate-900">
                        {feedback.phoneNumber || "N/A"}
                      </span>
                      <span className="ml-2 inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700">
                        <ShieldCheck className="size-3" />
                        Admin Access
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-md bg-amber-50/60 border border-amber-200/70 p-2.5 text-xs text-amber-800">
                      <p className="font-mono font-bold text-slate-800">
                        {feedback.phoneNumber}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
                        <Lock className="size-3 text-amber-600" />
                        Phone number is masked for your role ({capabilities.role}) per data protection policy.
                      </p>
                    </div>
                  )}
                </DetailRow>
              </div>

              {/* Written Feedback Section */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" />
                  Patient Comment
                </p>
                <div className="mt-2.5">
                  {feedback.comment ? (
                    <blockquote className="rounded-lg bg-slate-50 border-l-3 border-blue-500 p-3.5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                      &ldquo;{feedback.comment}&rdquo;
                    </blockquote>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      No written comment was provided with this submission.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Only for users with permission) */}
        {canManage && !editing && (
          <div className="border-t border-slate-200 bg-slate-50/70 px-6 py-4">
            {confirmDelete ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-5 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-900">
                      Confirm Soft Deletion
                    </h4>
                    <p className="mt-1 text-xs text-red-700 leading-relaxed">
                      This will remove the feedback from active views. In accordance with healthcare data compliance, the record is soft-deleted and preserved in audit archives.
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={busy}
                    className="inline-flex h-8.5 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy}
                    className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Yes, Delete Record
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                {capabilities.canUpdate && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(false);
                      setEditing(true);
                    }}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                  >
                    <Pencil className="size-4 text-slate-500" />
                    Edit Feedback
                  </button>
                )}

                {capabilities.canDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 shadow-xs transition hover:bg-red-100"
                  >
                    <Trash2 className="size-4" />
                    Delete Record
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
