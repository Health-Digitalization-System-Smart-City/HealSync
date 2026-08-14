"use client";

import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  Download,
  Filter,
  Layers,
  PieChart,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CLINIC_BRANCHES,
  MEDICAL_SERVICES,
  ANALYTICS_METRICS,
} from "@/lib/dashboard-data";
import type { Role } from "@/lib/permissions";

export function AnalyticsClient({ userRole }: { userRole: Role }) {
  const [timeRange, setTimeRange] = useState("30d");

  // Sorted branches by satisfaction
  const sortedBranches = [...CLINIC_BRANCHES].sort(
    (a, b) => b.satisfactionRating - a.satisfactionRating,
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Time Range Selector & Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Timeframe:
          </span>
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            {["7d", "30d", "90d", "1y"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  timeRange === range
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : range === "90d" ? "Last 90 Days" : "Past Year"}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto text-xs">
          <Download className="size-3.5" />
          <span>Export Telemetry (CSV)</span>
        </Button>
      </div>

      {/* 4 Analytics KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Promoter Score
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                +{ANALYTICS_METRICS.npsScore}
              </span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Tier 1 Benchmark
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {ANALYTICS_METRICS.npsChange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Patient Satisfaction
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="size-4 fill-amber-500/20" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {ANALYTICS_METRICS.averageSatisfaction}
              </span>
              <span className="text-xs text-muted-foreground">/ 5.0</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {ANALYTICS_METRICS.satisfactionChange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Responses
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {ANALYTICS_METRICS.totalSubmissions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {ANALYTICS_METRICS.submissionsChange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              SLA Resolution Rate
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {ANALYTICS_METRICS.slaResolutionRate}%
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {ANALYTICS_METRICS.slaChange}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Rating Distribution Breakdown (1 Col) */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown across 11,820 patient submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {ANALYTICS_METRICS.ratingDistribution.map((item) => (
              <div key={item.stars} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{item.stars}</span>
                  <span className="text-muted-foreground">{item.count.toLocaleString()} ({item.percentage}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.stars.includes("5") || item.stars.includes("4")
                        ? "bg-primary"
                        : item.stars.includes("3")
                          ? "bg-amber-500"
                          : "bg-destructive",
                    )}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">91% Positive Feedback Ratio</strong> (4 & 5 stars combined). Detractor rate is below the 5% city threshold.
            </div>
          </CardContent>
        </Card>

        {/* Monthly Feedback Growth & Satisfaction Trend (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Telemetry Trends (2026)</CardTitle>
              <CardDescription>Monthly volume scaling vs average satisfaction index</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Feedback Volume</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Satisfaction Score</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Custom Bar/Line Chart Visualization */}
            <div className="flex h-56 items-end gap-3 pt-6 border-b border-border/80 pb-2">
              {ANALYTICS_METRICS.monthlyTrends.map((t) => {
                const heightPercentage = Math.round((t.feedback / 1500) * 100);
                return (
                  <div key={t.month} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                    <div className="relative flex w-full flex-col items-center">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 rounded bg-popover px-1.5 py-0.5 text-[10px] font-bold text-popover-foreground shadow-xs whitespace-nowrap border border-border">
                        {t.feedback} reviews ({t.satisfaction}★)
                      </div>
                      <div
                        className="w-full max-w-[36px] rounded-t-md bg-primary/80 transition-all group-hover:bg-primary"
                        style={{ height: `${heightPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{t.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
              <div className="rounded-lg bg-muted/20 p-2 border border-border/40">
                <span className="text-[11px] text-muted-foreground">Peak Month</span>
                <p className="text-sm font-bold text-foreground">July (1,350)</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-2 border border-border/40">
                <span className="text-[11px] text-muted-foreground">Avg Response SLA</span>
                <p className="text-sm font-bold text-foreground">1.8 Hours</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-2 border border-border/40">
                <span className="text-[11px] text-muted-foreground">Sentiment Index</span>
                <p className="text-sm font-bold text-foreground">84% Positive</p>
              </div>
              <div className="rounded-lg bg-muted/20 p-2 border border-border/40">
                <span className="text-[11px] text-muted-foreground">Escalation Rate</span>
                <p className="text-sm font-bold text-foreground">1.2% Low</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 13-Branch Satisfaction Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>13 Smart City Branches — Performance Leaderboard</CardTitle>
          <CardDescription>
            Comparative satisfaction ratings, total feedback volume, and resolution rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Rank & Branch</th>
                  <th className="pb-3 font-semibold">District Zone</th>
                  <th className="pb-3 font-semibold">Director</th>
                  <th className="pb-3 font-semibold text-center">Satisfaction</th>
                  <th className="pb-3 font-semibold text-center">Feedback Volume</th>
                  <th className="pb-3 font-semibold text-center">Resolution Rate</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedBranches.map((branch, index) => (
                  <tr key={branch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-semibold text-foreground flex items-center gap-2">
                      <span className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                        index === 0 ? "bg-amber-500 text-white" : index === 1 ? "bg-slate-300 text-slate-800" : index === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                      <span>{branch.name}</span>
                    </td>
                    <td className="py-3 text-muted-foreground">{branch.zone}</td>
                    <td className="py-3 text-muted-foreground">{branch.director}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                        <Star className="size-3 fill-amber-500" />
                        {branch.satisfactionRating}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono text-muted-foreground">
                      {branch.totalFeedbackCount.toLocaleString()}
                    </td>
                    <td className="py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                      {branch.resolutionRate}%
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={branch.status === "optimal" ? "outline" : "secondary"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {branch.status.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
