import type { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  MessageSquare,
  Smile,
  TrendingUp,
  Star,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const canDelete = hasPermission(role, PERMISSIONS.SERVICE_DELETE);

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

  // Get top performing services
  const topServices = [...services]
    .filter((s) => s.isActive && s.totalFeedback > 0)
    .sort((a, b) => b.satisfactionRate - a.satisfactionRate)
    .slice(0, 3);

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

      {/* Top Performing Services */}
      {topServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Top Performing Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {topServices.map((service, index) => (
                <div
                  key={service.id}
                  className="hover:bg-muted/50 rounded-lg border p-4 transition"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-muted-foreground text-xs">
                          {service.description || "Clinical service"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-200 text-emerald-600"
                    >
                      {service.satisfactionRate}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">
                        {service.avgScore.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">/ 7.0</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{service.totalFeedback} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service grid + Admin management */}
      <ServicesView
        services={services}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
