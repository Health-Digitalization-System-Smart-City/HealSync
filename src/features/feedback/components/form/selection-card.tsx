"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Accessible single-select option card backed by a native radio input.
 *
 * Place multiple `SelectionCard`s with the same `name` inside a `<fieldset>`
 * to form a keyboard-navigable radio group (arrow keys, Space to select).
 * The input is visually hidden but focusable; the label receives a visible
 * focus ring via the `has-[:focus-visible]` variant, so keyboard users get
 * clear focus feedback without a second tab stop.
 */
export interface SelectionCardProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Radio group name (must match sibling cards). */
  name: string;
  selected?: boolean;
  /** Classes applied to the card when selected. */
  selectedClass?: string;
  className?: string;
  children: React.ReactNode;
}

export function SelectionCard({
  name,
  value,
  selected,
  selectedClass,
  className,
  children,
  disabled,
  ...inputProps
}: SelectionCardProps) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-all",
        "has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? (selectedClass ??
              "border-primary bg-primary/10 ring-primary/20 ring-2")
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={inputProps.onChange}
        disabled={disabled}
        {...inputProps}
        className="peer sr-only"
      />
      {children}
    </label>
  );
}
