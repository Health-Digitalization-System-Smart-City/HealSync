import * as React from "react";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact tinted panel for form-level and field-level messages.
 *
 * Use it for validation errors (`variant="error"`) or success confirmations
 * (`variant="success"`). The panel is a live region (`role="alert"` /
 * `role="status"`) and the message is set as its accessible name, because
 * alert/status roles are named by the author rather than their contents.
 */
export function FormAlert({
  variant = "error",
  messages,
  compact = false,
  id,
  className,
}: {
  variant?: "error" | "success";
  /** A single message or a list of messages. */
  messages?: string | string[];
  /** Compact variant for field-level errors. */
  compact?: boolean;
  /** Optional id for `aria-describedby` targets (placed on the message). */
  id?: string;
  className?: string;
}) {
  const list = Array.isArray(messages) ? messages : messages ? [messages] : [];
  if (list.length === 0) return null;

  const Icon = variant === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-label={list.join(" ")}
      className={cn(
        "animate-in fade-in flex items-start gap-2.5 rounded-lg border duration-200",
        variant === "error"
          ? "border-destructive/20 bg-destructive/5 text-destructive"
          : "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
        compact ? "px-3 py-2" : "px-3.5 py-3",
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
        aria-hidden="true"
      />
      {list.length === 1 ? (
        <p
          id={id}
          className={cn(
            "leading-relaxed font-medium",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {list[0]}
        </p>
      ) : (
        <ul
          id={id}
          className={cn(
            "space-y-0.5 font-medium",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {list.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
