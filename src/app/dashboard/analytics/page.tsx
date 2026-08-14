import {
  Activity,
  Frown,
  HeartPulse,
  Lock,
  Meh,
  MessageSquareText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { requirePermission } from "@/lib/auth/permissions";
import {
  getBranchAnalytics,
  getDashboardSummary,
  getServiceAnalytics,
  getSatisfactionDistribution,
} from "@/features/analytics/actions";

export default async function DashboardAnalyticsPage() {
  const authResult = await requirePermission("analytics.read");
  if (!authResult.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
          <Lock className="text-muted-foreground h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            Your role does not have permission to view analytics.
          </p>
        </div>
      </div>
    );
  }

  const [summaryResult, distributionResult, branchesResult, servicesResult] =
    await Promise.all([
      getDashboardSummary(),
      getSatisfactionDistribution(),
      getBranchAnalytics(),
      getServiceAnalytics(),
    ]);

  const summary = summaryResult.success ? summaryResult.data : null;
  const distribution = distributionResult.success
    ? distributionResult.data
    : [];
  const branchAnalytics = branchesResult.success ? branchesResult.data : [];
  const serviceAnalytics = servicesResult.success ? servicesResult.data : [];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow={
          <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
            <Activity className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            Analytics
          </Badge>
        }
        title="Clinic performance overview"
        description="Feedback metrics and branch/service comparisons are calculated from the source-of-truth data in PostgreSQL."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total feedback"
          value={summary?.totalFeedback ?? 0}
          detail="All recorded patient responses"
          icon={MessageSquareText}
        />
        <MetricCard
          label="Satisfaction"
          value={`${summary?.satisfactionRate ?? 0}%`}
          detail="Positive experiences"
          icon={HeartPulse}
        />
        <MetricCard
          label="Neutral"
          value={`${summary?.neutralRate ?? 0}%`}
          detail="Neither positive nor negative"
          icon={Meh}
        />
        <MetricCard
          label="Negative"
          value={`${summary?.negativeRate ?? 0}%`}
          detail="Responses needing attention"
          icon={Frown}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feedback distribution</CardTitle>
            <CardDescription>
              Rating mix across the active dataset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {distribution.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No ratings recorded yet.
              </p>
            ) : (
              distribution.map((item) => (
                <div key={item.rating}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{item.rating.replace(/_/g, " ").toLowerCase()}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="bg-muted h-2 rounded-full">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top branches</CardTitle>
            <CardDescription>
              Branch performance by satisfaction rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {branchAnalytics.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No branch feedback available.
              </p>
            ) : (
              branchAnalytics.slice(0, 5).map((item) => (
                <div
                  key={item.branchId}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium">{item.branchName}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.total} feedback entries
                    </p>
                  </div>
                  <span className="font-semibold">
                    {item.satisfactionRate}%
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service insights</CardTitle>
          <CardDescription>
            Departments ranked by overall satisfaction mix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {serviceAnalytics.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No service feedback available.
            </p>
          ) : (
            serviceAnalytics.slice(0, 6).map((item) => (
              <div
                key={item.serviceId}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{item.serviceName}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.total} feedback entries
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.satisfactionRate}%</p>
                  <p className="text-muted-foreground text-xs">satisfaction</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
