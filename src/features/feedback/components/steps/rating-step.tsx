"use client";

import * as React from "react";

import {
  AlertCircle,
  Frown,
  Meh,
  MessageSquare,
  Smile,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { FeedbackRating } from "@/lib/validation";
import { FEEDBACK_COMMENT_MAX_LENGTH } from "@/lib/validation/feedback";
import { FormAlert } from "@/components/form-alert";
import { FormField } from "@/features/feedback/components/form/form-field";
import { SelectionCard } from "@/features/feedback/components/form/selection-card";
import { StepHeader } from "@/features/feedback/components/steps/step-header";
import { useFeedbackI18n } from "@/features/feedback/components/feedback-i18n";

interface RatingOption {
  value: FeedbackRating;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  colorClass: string;
  selectedBgClass: string;
}

const RATING_OPTIONS: RatingOption[] = [
  {
    value: "VERY_SATISFIED",
    label: "Very Satisfied",
    description: "Exceptional service and care",
    icon: Sparkles,
    colorClass: "text-emerald-500 border-emerald-200 dark:border-emerald-900",
    selectedBgClass:
      "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20",
  },
  {
    value: "SATISFIED",
    label: "Satisfied",
    description: "Met all expectations",
    icon: Smile,
    colorClass: "text-green-500 border-green-200 dark:border-green-900",
    selectedBgClass:
      "bg-green-500/10 border-green-500 ring-2 ring-green-500/20",
  },
  {
    value: "MOSTLY_SATISFIED",
    label: "Mostly Satisfied",
    description: "Good overall, minor issues",
    icon: ThumbsUp,
    colorClass: "text-teal-500 border-teal-200 dark:border-teal-900",
    selectedBgClass: "bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/20",
  },
  {
    value: "GOOD",
    label: "Good",
    description: "Decent experience",
    icon: Smile,
    colorClass: "text-cyan-500 border-cyan-200 dark:border-cyan-900",
    selectedBgClass: "bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/20",
  },
  {
    value: "NEUTRAL",
    label: "Neutral",
    description: "Neither good nor bad",
    icon: Meh,
    colorClass: "text-amber-500 border-amber-200 dark:border-amber-900",
    selectedBgClass:
      "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20",
  },
  {
    value: "NOT_SATISFIED",
    label: "Not Satisfied",
    description: "Fell short of expectations",
    icon: ThumbsDown,
    colorClass: "text-orange-500 border-orange-200 dark:border-orange-900",
    selectedBgClass:
      "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20",
  },
  {
    value: "POOR",
    label: "Poor",
    description: "Unsatisfactory experience",
    icon: Frown,
    colorClass: "text-rose-500 border-rose-200 dark:border-rose-900",
    selectedBgClass: "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20",
  },
  {
    value: "VERY_POOR",
    label: "Very Poor",
    description: "Severe issues encountered",
    icon: AlertCircle,
    colorClass: "text-red-500 border-red-200 dark:border-red-900",
    selectedBgClass: "bg-red-500/10 border-red-500 ring-2 ring-red-500/20",
  },
];

const RATING_MESSAGE_KEYS = [
  ["verySatisfied", "verySatisfiedText"],
  ["satisfied", "satisfiedText"],
  ["mostlySatisfied", "mostlySatisfiedText"],
  ["good", "goodText"],
  ["neutral", "neutralText"],
  ["notSatisfied", "notSatisfiedText"],
  ["poor", "poorText"],
  ["veryPoor", "veryPoorText"],
] as const;

export function RatingStep({
  headingRef,
  rating,
  comment,
  ratingErrors,
  commentErrors,
  branchName,
  serviceName,
  isSubmitting,
  onRatingSelect,
  onCommentChange,
  onBack,
  onSubmit,
}: {
  headingRef?: React.Ref<HTMLHeadingElement>;
  rating: FeedbackRating | "";
  comment: string;
  ratingErrors: string[];
  commentErrors: string[];
  branchName: string;
  serviceName: string;
  isSubmitting: boolean;
  onRatingSelect: (rating: FeedbackRating) => void;
  onCommentChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { t } = useFeedbackI18n();
  const hasRatingErrors = ratingErrors.length > 0;
  const isNearLimit = comment.length >= FEEDBACK_COMMENT_MAX_LENGTH;
  const ratingOptions = RATING_OPTIONS.map((option, index) => ({
    ...option,
    label: t(RATING_MESSAGE_KEYS[index][0]),
    description: t(RATING_MESSAGE_KEYS[index][1]),
  }));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className="space-y-6 p-5 sm:p-6">
        <StepHeader
          headingRef={headingRef}
          icon={MessageSquare}
          title={t("rateTitle")}
          description={
            <>
              {t("rateDescriptionStart")}{" "}
              <span className="text-foreground font-semibold">
                {serviceName}
              </span>{" "}
              {t("rateDescriptionAt")}{" "}
              <span className="text-foreground font-semibold">
                {branchName}
              </span>
              .
            </>
          }
          onBack={onBack}
        />

        <fieldset
          aria-describedby={hasRatingErrors ? "rating-error" : undefined}
        >
          <legend className="text-sm font-medium">
            {t("overallRating")}{" "}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ratingOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = rating === option.value;
              return (
                <SelectionCard
                  key={option.value}
                  name="rating"
                  value={option.value}
                  selected={isSelected}
                  onChange={() => onRatingSelect(option.value)}
                  selectedClass={option.selectedBgClass}
                  className="min-h-28 flex-col justify-center p-3 text-center"
                >
                  <span
                    className={cn(
                      "mb-1.5 rounded-full border p-2",
                      option.colorClass,
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden={true} />
                  </span>
                  <span className="text-foreground text-xs leading-tight font-semibold">
                    {option.label}
                  </span>
                  <span className="text-muted-foreground mt-0.5 line-clamp-1 text-[10px]">
                    {option.description}
                  </span>
                </SelectionCard>
              );
            })}
          </div>
          <FormAlert
            messages={ratingErrors}
            id="rating-error"
            className="mt-3"
          />
        </fieldset>

        <FormField
          id="comment"
          label={t("writtenFeedback")}
          optional
          counter={`${comment.length} / ${FEEDBACK_COMMENT_MAX_LENGTH}`}
          errors={commentErrors}
          className="pt-2"
        >
          <Textarea
            rows={4}
            maxLength={FEEDBACK_COMMENT_MAX_LENGTH}
            placeholder={t("commentPlaceholder")}
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            error={commentErrors.length > 0}
            className="resize-none text-sm"
          />
        </FormField>
        <p className="sr-only" aria-live="polite">
          {isNearLimit
            ? t("commentLimit", { count: FEEDBACK_COMMENT_MAX_LENGTH })
            : ""}
        </p>
      </div>
      <CardFooter className="flex flex-col gap-3 border-t px-5 pt-4 pb-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {t("backServices")}
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full gap-2 font-semibold sm:w-auto sm:min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <span
                className="text-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              {t("submitting")}
            </>
          ) : (
            <>
              {t("submit")}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </>
          )}
        </Button>
      </CardFooter>
    </form>
  );
}
