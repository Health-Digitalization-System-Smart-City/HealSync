import {
  BarChart3,
  HeartPulse,
  MessageSquareText,
  ShieldCheck,
  SmilePlus,
  TrendingDown,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import {
  getDashboardSummary,
  getSatisfactionDistribution,
} from "@/features/analytics/actions";

export const metadata: Metadata = {
  title: "Dashboard | HealSync",
  description: "Administrative dashboard for HealSync healthcare clinics.",
};

export default async function DashboardPage() {
  const authResult = await requireUser();
  if (!authResult.success) return null; // layout already redirects

  const user = authResult.data;
  const canManageUsers = await can(user.id, "user.read");
  const [summaryResult, distributionResult] = await Promise.all([
    getDashboardSummary(),
    getSatisfactionDistribution(),
  ]);

  const summary = summaryResult.success ? summaryResult.data : null;
  const distribution = distributionResult.success
    ? distributionResult.data
    : [];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow={
          <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            Signed in as {user.role}
          </Badge>
        }
        title={<>Welcome back, {user.name.split(" ")[0] || user.name}</>}
        description="Monitor patient sentiment, spot operational issues early, and keep the clinic network aligned around the feedback that matters most."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total feedback"
          value={summary?.totalFeedback ?? 0}
          detail="All recorded patient responses"
          icon={MessageSquareText}
        />
        <MetricCard
          label="Satisfaction rate"
          value={`${summary?.satisfactionRate ?? 0}%`}
          detail="Positive patient experiences"
          icon={SmilePlus}
        />
        <MetricCard
          label="Negative feedback"
          value={`${summary?.negativeRate ?? 0}%`}
          detail="Responses needing attention"
          icon={TrendingDown}
        />
        <MetricCard
          label="Feedback today"
          value={summary?.todayCount ?? 0}
          detail="New responses since midnight"
          icon={HeartPulse}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-primary h-5 w-5" aria-hidden />
              Satisfaction mix
            </CardTitle>
            <CardDescription>
              Distribution of the latest feedback by rating category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {distribution.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No feedback has been submitted yet.
              </p>
            ) : (
              distribution
                .filter((item) => item.count > 0)
                .map((item) => (
                  <div key={item.rating} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {item.rating.replace(/_/g, " ").toLowerCase()}
                      </span>
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

        <Card className="border-primary/20 from-primary/5 bg-linear-to-b to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary h-5 w-5" aria-hidden />
              Administration
            </CardTitle>
            <CardDescription>
              Create dashboard users, assign roles, and disable access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManageUsers ? (
              <Link
                href="/dashboard/users"
                className={
                  buttonVariants({ variant: "default", size: "sm" }) +
                  " gap-2 font-semibold"
                }
              >
                <Users className="h-4 w-4" aria-hidden />
                Manage users
              </Link>
            ) : (
              <span className="text-muted-foreground text-sm">
                User management access is restricted to your role.
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <HeartPulse className="h-4 w-4 text-emerald-500" aria-hidden />
        Authentication &amp; role-based access control are active.
      </p>
    </div>
  );
}
