"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const FLOW_STEPS = [
  { number: 1, label: "Phone" },
  { number: 2, label: "Branch" },
  { number: 3, label: "Service" },
  { number: 4, label: "Rating" },
] as const;

export type FlowStepNumber = (typeof FLOW_STEPS)[number]["number"];

export function StepIndicator({
  currentStep,
  onSelect,
}: {
  currentStep: FlowStepNumber;
  /** Called when the user clicks a completed step to navigate back. */
  onSelect: (step: FlowStepNumber) => void;
}) {
  return (
    <nav aria-label="Feedback progress" className="pt-2">
      <ol className="flex items-center justify-center gap-1.5 sm:gap-2">
        {FLOW_STEPS.map((step, index) => {
          const isCurrent = step.number === currentStep;
          const isDone = step.number < currentStep;
          const isFuture = step.number > currentStep;
          return (
            <li
              key={step.number}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <button
                type="button"
                onClick={() => onSelect(step.number)}
                disabled={isFuture}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${step.number} of 4: ${step.label}${
                  isDone ? " (completed)" : ""
                }`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-primary/20 ring-4",
                  isDone &&
                    "cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600",
                  isFuture &&
                    "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {isDone ? (
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
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <span aria-hidden="true">{step.number}</span>
                )}
              </button>
              {index < FLOW_STEPS.length - 1 ? (
                <div
                  aria-hidden="true"
                  className={cn(
                    "h-1 w-7 rounded-full transition-all sm:w-8",
                    isDone ? "bg-emerald-500" : "bg-muted",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p
        aria-live="polite"
        className="text-muted-foreground mt-2 text-center text-xs font-medium"
      >
        Step {currentStep} of 4 ·{" "}
        {FLOW_STEPS.find((s) => s.number === currentStep)?.label}
      </p>
    </nav>
  );
}
