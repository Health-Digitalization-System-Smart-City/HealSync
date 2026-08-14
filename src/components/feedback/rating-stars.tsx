"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_STARS = 5;

function scoreToStars(score: number): number {
  return Math.round((score / 7) * MAX_STARS);
}

export function RatingStars({
  score,
  showValue = false,
  className,
}: {
  score: number;
  showValue?: boolean;
  className?: string;
}) {
  const stars = scoreToStars(score);

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className="inline-flex items-center" aria-hidden="true">
        {Array.from({ length: MAX_STARS }, (_, index) => (
          <Star
            key={index}
            className={cn(
              "size-4",
              index < stars
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200",
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="ml-1 text-xs font-medium text-slate-500">
          {stars}/5
        </span>
      )}
    </span>
  );
}
