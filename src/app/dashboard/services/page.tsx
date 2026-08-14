import type { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  MessageSquare,
  Smile,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/page-intro";
import { MetricCard } from "@/components/metric-card";
import { ServicesView } from "@/components/dashboard/service-management";
import { requirePermission } from "@/lib/auth/session";
import { hasPermission, PERMISSIONS, ROLES } from "@/lib/permissions";
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
  const session = await requirePermission(PERMISSIONS.SERVICE_READ);
  const role = session.user.role ?? ROLES.ANALYST;
  const canCreate = hasPermission(role, PERMISSIONS.SERVICE_CREATE);
  const canUpdate = hasPermission(role, PERMISSIONS.SERVICE_UPDATE);

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
        description="Every medical department ranked by patient satisfaction, with live feedback statistics and attention flags. Administrators can add, edit, and stop offering services."
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

      {/* Service grid + Admin management */}
      <ServicesView
        services={services}
        canCreate={canCreate}
        canUpdate={canUpdate}
      />
    </div>
  );
}
