import type { Metadata } from "next";
import { Activity, Building2, MessageSquare, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/page-intro";
import { MetricCard } from "@/components/metric-card";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import {
  listServicesWithAnalytics,
  type ServiceOverview,
} from "@/lib/analytics/db";

export const metadata: Metadata = {
  title: "Services",
  description: "All medical services with their live feedback statistics.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  await requirePermission(PERMISSIONS.SERVICE_READ);

  let services: ServiceOverview[] = [];
  try {
    services = await listServicesWithAnalytics();
  } catch (error) {
    console.error("Failed to load services:", error);
  }

  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;
  const totalFeedback = services.reduce((sum, s) => sum + s.totalFeedback, 0);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow={
          <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
            <Activity className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            Management
          </Badge>
        }
        title="Healthcare Services"
        description="Every medical department with its live patient-feedback statistics."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Services"
          value={totalServices}
          icon={Activity}
        />
        <MetricCard
          label="Active Services"
          value={activeServices}
          icon={Building2}
          detail={`${Math.max(0, totalServices - activeServices)} inactive`}
        />
        <MetricCard
          label="Total Feedback"
          value={totalFeedback.toLocaleString()}
          icon={MessageSquare}
        />
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            No services are configured yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-semibold">{service.name}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    service.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {service.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {service.description ? (
                <p className="mt-3 text-slate-500">{service.description}</p>
              ) : null}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Feedback</p>
                  <p className="mt-1 text-lg font-bold">
                    {service.totalFeedback.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Star className="size-3 text-amber-500" aria-hidden />
                    Satisfaction
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {service.satisfactionRate}%
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Avg rating</p>
                  <p className="mt-1 text-lg font-bold">
                    {service.avgScore.toFixed(1)}
                    <span className="text-xs font-medium text-slate-400">
                      {" "}
                      / 7
                    </span>
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Branches</p>
                  <p className="mt-1 text-lg font-bold">
                    {service.branchesCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
