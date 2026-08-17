import { Building2, Stethoscope, TrendingDown, TrendingUp } from "lucide-react";

import type {
  BranchPerformanceItem,
  ServicePerformanceItem,
} from "@/lib/analytics/insights-types";
import { cn } from "@/lib/utils";

function ChangeBadge({ change }: { change: number | null }) {
  if (change === null) return null;
  const up = change > 0;
  const flat = change === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        up
          ? "bg-emerald-50 text-emerald-700"
          : flat
            ? "bg-slate-100 text-slate-500"
            : "bg-rose-50 text-rose-700",
      )}
    >
      {up ? (
        <TrendingUp className="size-3" aria-hidden />
      ) : flat ? null : (
        <TrendingDown className="size-3" aria-hidden />
      )}
      {up ? "+" : ""}
      {change} pts
    </span>
  );
}

function RatingBar({ satisfactionRate }: { satisfactionRate: number }) {
  const tone =
    satisfactionRate >= 75
      ? "bg-emerald-500"
      : satisfactionRate >= 50
        ? "bg-amber-400"
        : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", tone)}
          style={{ width: `${Math.min(100, Math.max(0, satisfactionRate))}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700">
        {satisfactionRate}%
      </span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-xs">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyTable({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
      {message}
    </p>
  );
}

export function BranchPerformanceTable({
  branches,
}: {
  branches: BranchPerformanceItem[];
}) {
  return (
    <SectionCard
      icon={<Building2 className="size-4 text-blue-600" aria-hidden />}
      title="Branch Performance"
      subtitle="Deterministic analytics · ranked by the database"
    >
      {branches.length === 0 ? (
        <EmptyTable message="No branch feedback in this period." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] tracking-wider text-slate-400 uppercase">
                <th className="pb-2 pr-3 font-semibold">Branch</th>
                <th className="pb-2 pr-3 font-semibold">Feedback</th>
                <th className="pb-2 pr-3 font-semibold">Avg Rating</th>
                <th className="pb-2 pr-3 font-semibold">Satisfaction</th>
                <th className="pb-2 font-semibold">vs Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {branches.map((branch) => (
                <tr key={branch.branchId}>
                  <td className="py-2.5 pr-3 font-semibold text-slate-800">
                    {branch.branchName}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600">
                    {branch.feedbackCount}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600">
                    {branch.averageRating.toFixed(1)} / 7
                  </td>
                  <td className="py-2.5 pr-3">
                    <RatingBar satisfactionRate={branch.satisfactionRate} />
                  </td>
                  <td className="py-2.5">
                    <ChangeBadge
                      change={branch.changeFromPreviousPeriod}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

export function ServicePerformanceTable({
  services,
}: {
  services: ServicePerformanceItem[];
}) {
  return (
    <SectionCard
      icon={<Stethoscope className="size-4 text-emerald-600" aria-hidden />}
      title="Service Performance"
      subtitle="Deterministic analytics · ranked by the database"
    >
      {services.length === 0 ? (
        <EmptyTable message="No service feedback in this period." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] tracking-wider text-slate-400 uppercase">
                <th className="pb-2 pr-3 font-semibold">Service</th>
                <th className="pb-2 pr-3 font-semibold">Feedback</th>
                <th className="pb-2 pr-3 font-semibold">Avg Rating</th>
                <th className="pb-2 pr-3 font-semibold">Satisfaction</th>
                <th className="pb-2 font-semibold">vs Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {services.map((service) => (
                <tr key={service.serviceId}>
                  <td className="py-2.5 pr-3 font-semibold text-slate-800">
                    {service.serviceName}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600">
                    {service.feedbackCount}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600">
                    {service.averageRating.toFixed(1)} / 7
                  </td>
                  <td className="py-2.5 pr-3">
                    <RatingBar satisfactionRate={service.satisfactionRate} />
                  </td>
                  <td className="py-2.5">
                    <ChangeBadge change={service.changeFromPreviousPeriod} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
