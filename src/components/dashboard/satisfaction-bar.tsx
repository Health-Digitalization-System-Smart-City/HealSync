import { cn } from "@/lib/utils";

type SatisfactionBarProps = {
  positive: number;
  neutral: number;
  negative: number;
  className?: string;
  /** Show the count legend under the bar. */
  showLegend?: boolean;
};

/**
 * A segmented positive / neutral / negative sentiment bar.
 *
 * Used by branch, service, and overview cards so every satisfaction stat is
 * shown with the exact same visual language (emerald = satisfied, slate =
 * neutral, amber = needs attention).
 */
export function SatisfactionBar({
  positive,
  neutral,
  negative,
  className,
  showLegend = true,
}: SatisfactionBarProps) {
  const total = Math.max(1, positive + neutral + negative);
  const positivePct = (positive / total) * 100;
  const neutralPct = (neutral / total) * 100;
  const negativePct = (negative / total) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={`${positive} satisfied, ${neutral} neutral, ${negative} needs attention`}
      >
        <div
          style={{ width: `${positivePct}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Satisfied: ${positive}`}
        />
        <div
          style={{ width: `${neutralPct}%` }}
          className="bg-slate-300 transition-all duration-500"
          title={`Neutral: ${neutral}`}
        />
        <div
          style={{ width: `${negativePct}%` }}
          className="bg-amber-500 transition-all duration-500"
          title={`Needs attention: ${negative}`}
        />
      </div>

      {showLegend && (
        <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
            Satisfied
            <strong className="text-emerald-700">
              {positive.toLocaleString()}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-300" aria-hidden />
            Neutral
            <strong className="text-slate-600">
              {neutral.toLocaleString()}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" aria-hidden />
            Attention
            <strong className="text-amber-700">
              {negative.toLocaleString()}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
