"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number;
  /** Number of decimal places */
  decimals?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Prefix string (e.g., "$", "₹") */
  prefix?: string;
  /** Suffix string (e.g., "%", "x") */
  suffix?: string;
  /** Show comma formatting for thousands */
  format?: boolean;
  /** Optional className for the container */
  className?: string;
  /** Optional className for the number text */
  numberClassName?: string;
  /** Delay before animation starts in ms */
  delay?: number;
}

/**
 * Animates a number counting up from 0 to the target value.
 * Uses requestAnimationFrame with easeOutExpo for smooth deceleration.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1200,
  prefix = "",
  suffix = "",
  format = true,
  className,
  numberClassName,
  delay = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const prevValueRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;

    if (startValue === endValue) return;

    let startTime: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo — fast start, smooth deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
      }
    };

    if (delay > 0) {
      timeoutId = setTimeout(() => {
        rafRef.current = requestAnimationFrame(animate);
      }, delay);
    } else {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [value, duration, delay]);

  const formatted = format
    ? Math.round(displayValue).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : displayValue.toFixed(decimals);

  return (
    <span className={cn("tabular-nums", className)}>
      <span className={numberClassName}>{prefix}</span>
      <span className={numberClassName}>{formatted}</span>
      <span className={numberClassName}>{suffix}</span>
    </span>
  );
}
