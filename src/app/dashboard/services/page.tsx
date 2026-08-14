import type { Metadata } from "next";
import { Activity, AlertTriangle, MessageSquare, Smile } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/page-intro";
import { MetricCard } from "@/components/metric-card";
import { ServiceCard } from "@/components/dashboard/service-card";
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
  const activeServices = services.filter((s) => s.isActive);
  const activeCount = activeServices.length;
  const totalFeedback = services.reduce((sum, s) => sum + s.totalFeedback, 0);
  const avgSatisfaction =
    activeCount > 0
      ? Math.round(
          activeServices.reduce((sum, s) => sum + s.satisfactionRate, 0) /
            activeCount,
        )
      : 0;
  const needsAttention = activeServices.filter(
    (s) => s.satisfactionRate < 50,
  ).length;

  // Leaderboard order: active first, then best-performing first.
  const ranked = [...services].sort(
    (a, b) =>
      Number(b.isActive) - Number(a.isActive) ||
      b.satisfactionRate - a.satisfactionRate,
  );

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow={
          <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
            <Activity className="h-3.5 w-3.5 text-teal-600" aria-hidden />
            Management
          </Badge>
        }
        title="Healthcare Services"
        description="Every medical department ranked by patient satisfaction, with live feedback statistics and attention flags."
      />

      {/* Insight metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Services"
          value={totalServices}
          icon={Activity}
          accent="teal"
          detail={`${activeCount} active · ${Math.max(0, totalServices - activeCount)} inactive`}
        />
        <MetricCard
          label="Avg Satisfaction"
          value={`${avgSatisfaction}%`}
          icon={Smile}
          accent="emerald"
          detail="across active services"
        />
        <MetricCard
          label="Total Feedback"
          value={totalFeedback.toLocaleString()}
          icon={MessageSquare}
          accent="blue"
          detail="patient submissions all-time"
        />
        <MetricCard
          label="Needs Attention"
          value={needsAttention}
          icon={AlertTriangle}
          accent="amber"
          detail="active services under 50% satisfaction"
        />
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            No services are configured yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ranked.map((service, index) => (
            <ServiceCard key={service.id} service={service} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
