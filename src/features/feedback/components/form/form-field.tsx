"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Reusable accessible form field wrapper.
 *
 * Renders a label, the control, an optional hint, an optional character
 * counter, and validation errors. The single control child is cloned so the
 * field automatically wires up `id`, `aria-invalid`, and `aria-describedby`
 * (pointing at the hint/error messages) — callers never have to duplicate
 * ARIA wiring.
 */
interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** Shows "(Optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the control. */
  hint?: string;
  errors?: string[];
  /** e.g. "240 / 1000" rendered top-right of the field. */
  counter?: string;
  className?: string;
  /** The form control element (Input/Textarea/…). Must be a single element. */
  children: React.ReactElement<Partial<FormControlProps>>;
}

interface FormControlProps extends React.HTMLAttributes<HTMLElement> {
  error?: boolean;
}

export function FormField({
  id,
  label,
  required,
  optional,
  hint,
  errors = [],
  counter,
  className,
  children,
}: FormFieldProps) {
  const hasErrors = errors.length > 0;
  const describedBy = [
    hint ? `${id}-hint` : null,
    hasErrors ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const control = React.cloneElement<Partial<FormControlProps>>(children, {
    id,
    "aria-invalid": hasErrors ? true : undefined,
    "aria-describedby": describedBy || undefined,
  });

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </Label>
        <span className="flex items-center gap-2">
          {optional ? (
            <span className="text-muted-foreground text-xs font-normal">
              (Optional)
            </span>
          ) : null}
          {counter ? (
            <span
              className="text-muted-foreground font-mono text-xs"
              aria-hidden="true"
            >
              {counter}
            </span>
          ) : null}
        </span>
      </div>

      {control}

      {hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}

      {hasErrors ? (
        <ul
          id={`${id}-error`}
          className="text-destructive space-y-1 text-xs font-medium"
        >
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
