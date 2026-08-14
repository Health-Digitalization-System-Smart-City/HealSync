"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  MessageSquareText,
  Shield,
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
  DASHBOARD_TASKS,
  PATIENT_FEEDBACK_DATA,
  ANALYTICS_METRICS,
  type PatientFeedback,
  type DashboardTask,
} from "@/lib/dashboard-data";
import type { Role } from "@/lib/permissions";

export function OverviewClient({
  userName,
  userRole,
}: {
  userName: string;
  userRole: Role;
}) {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [tasks, setTasks] = useState<DashboardTask[]>(DASHBOARD_TASKS);

  const filteredFeedback =
    selectedBranch === "all"
      ? PATIENT_FEEDBACK_DATA
      : PATIENT_FEEDBACK_DATA.filter((fb) => fb.branchName === selectedBranch);

  const urgentTasks = tasks.filter((t) => t.status !== "completed");
  const highPriorityBranches = CLINIC_BRANCHES.filter((b) => b.status === "high_volume");

  function toggleTaskStatus(taskId: string) {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: task.status === "completed" ? "pending" : "completed",
          };
        }
        return task;
      }),
    );
  }

  const roleGreeting =
    userRole === "admin"
      ? "Full Administrative Access: 13 Clinic Branches, Staff, and Services active under your supervision."
      : userRole === "manager"
        ? "Operational Management Access: Monitoring triage, patient feedback streams, and clinic branch workflows."
        : "Analyst Access: Live BI telemetry, satisfaction indices, and aggregated patient sentiment data.";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Role-tailored Greeting Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-primary/10 via-card to-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Welcome back, {userName.split(" ")[0]}
              </h2>
              <Badge
                variant={userRole === "admin" ? "default" : userRole === "manager" ? "secondary" : "outline"}
                className="font-mono text-[10px] uppercase font-bold tracking-wider"
              >
                {userRole}
              </Badge>
            </div>
            <p className="max-w-2xl text-xs text-muted-foreground leading-relaxed sm:text-sm">
              {roleGreeting}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/dashboard/analytics" />}
              className="gap-1.5"
            >
              <TrendingUp className="size-3.5" />
              <span>View Analytics</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              render={<Link href="/dashboard/tasks" />}
              className="gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Review Tasks</span>
            </Button>
          </div>
        </div>

        {/* Quick status bar */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500"></span>
            <span>Network: <strong>13/13 Branches Operational</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            <span>Avg Wait: <strong>11.4 mins</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="size-3.5 text-primary" />
            <span>SLA Compliance: <strong>95.8%</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Metric 1 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Feedback
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquareText className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {ANALYTICS_METRICS.totalSubmissions.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="size-3" />
              <span>{ANALYTICS_METRICS.submissionsChange}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Satisfaction
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="size-4 fill-amber-500/20" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {ANALYTICS_METRICS.averageSatisfaction}
              </span>
              <span className="text-xs text-muted-foreground">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="size-3" />
              <span>{ANALYTICS_METRICS.satisfactionChange}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Promoter Score (NPS)
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                +{ANALYTICS_METRICS.npsScore}
              </span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Excellent
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="size-3" />
              <span>{ANALYTICS_METRICS.npsChange}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Smart City Branches
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                13 / 13
              </span>
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>95.8% resolution compliance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Urgent Workflows & Patient Feedback Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Recent Patient Feedback Stream */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
            <div>
              <CardTitle>Recent Patient Feedback</CardTitle>
              <CardDescription>
                Live patient reviews collected across Smart City clinic branches.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter feedback by branch"
              >
                <option value="all">All 13 Branches</option>
                {CLINIC_BRANCHES.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="xs"
                render={<Link href="/dashboard/feedback" />}
                className="gap-1 text-xs"
              >
                <span>View All</span>
                <ChevronRight className="size-3" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {filteredFeedback.slice(0, 4).map((fb) => (
              <div
                key={fb.id}
                className="flex flex-col gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3.5 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-semibold text-amber-500 text-xs">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      <span>{fb.rating}.0</span>
                    </span>
                    <span className="text-xs font-semibold text-foreground">{fb.branchName}</span>
                    <span className="text-[11px] text-muted-foreground">• {fb.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={fb.sentiment === "positive" ? "default" : fb.sentiment === "negative" ? "destructive" : "secondary"}
                      className="text-[10px] capitalize"
                    >
                      {fb.sentiment}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{fb.submittedAt}</span>
                  </div>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed italic">
                  &ldquo;{fb.comment}&rdquo;
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
                  <div className="flex flex-wrap gap-1.5">
                    {fb.predefinedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Phone: {userRole === "admin" ? fb.patientPhone : "+1 (555) ***-****"}
                  </span>
                </div>
              </div>
            ))}

            <Button
              variant="ghost"
              render={<Link href="/dashboard/feedback" />}
              className="w-full justify-center text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <span>Explore all {PATIENT_FEEDBACK_DATA.length} feedback responses</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Right 1 Col: Urgent Operational Tasks Checklist */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Operational Tasks</CardTitle>
                <CardDescription>
                  Active clinic tickets & follow-ups.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="xs"
                render={<Link href="/dashboard/tasks" />}
                className="gap-1 text-xs"
              >
                <span>Tasks Hub</span>
                <ChevronRight className="size-3" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-2.5">
              {urgentTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-all cursor-pointer select-none",
                    task.status === "completed"
                      ? "border-border/50 bg-muted/20 opacity-60 line-through"
                      : "border-border/80 bg-card hover:bg-muted/40",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                      task.status === "completed"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-foreground truncate">
                        {task.title}
                      </span>
                      <Badge
                        variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "secondary" : "outline"}
                        className="text-[9px] uppercase px-1 py-0"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {task.branchName} • {task.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Attention Alerts / High Volume Clinics */}
          {highPriorityBranches.length > 0 ? (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="size-4" />
                  <CardTitle className="text-sm font-semibold">
                    High Volume Branches
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {highPriorityBranches.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-md bg-background/80 p-2 border border-amber-500/20"
                  >
                    <span className="font-medium text-foreground">{b.name}</span>
                    <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/40">
                      High Load
                    </Badge>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground mt-1">
                  Consider re-allocating floating triage staff to reduce patient wait times.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* 13-Branch Health Quick Snapshot */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>13 Smart City Clinic Branches Snapshot</CardTitle>
            <CardDescription>
              Real-time branch satisfaction indices and active capacity.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/branches" />}
            className="gap-1.5 text-xs"
          >
            <Building2 className="size-3.5" />
            <span>Manage All Branches</span>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {CLINIC_BRANCHES.slice(0, 8).map((branch) => (
              <div
                key={branch.id}
                className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 transition-all hover:border-primary/40 hover:shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                      {branch.code}
                    </span>
                    <Badge
                      variant={branch.status === "optimal" ? "outline" : "secondary"}
                      className="text-[9px] uppercase px-1 py-0"
                    >
                      {branch.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-bold text-foreground leading-snug truncate">
                    {branch.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {branch.zone}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                  <div className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="size-3 fill-amber-500" />
                    <span>{branch.satisfactionRating}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {branch.totalFeedbackCount} reviews
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
