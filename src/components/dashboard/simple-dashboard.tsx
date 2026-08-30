"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  HeartPulse,
  MessageSquare,
  Smile,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SatisfactionBar } from "@/components/dashboard/satisfaction-bar";
import { cn } from "@/lib/utils";

interface SimpleDashboardProps {
  firstName: string;
  overviewData: {
    totalFeedback: number;
    todayFeedback: number;
    satisfactionRate: number;
    avgRatingScore: number;
    positiveFeedback: number;
    neutralFeedback: number;
    negativeFeedback: number;
    activeBranches: number;
    activeServices: number;
  };
}

export function SimpleDashboard({
  firstName,
  overviewData,
}: SimpleDashboardProps) {
  const router = useRouter();

  const {
    totalFeedback,
    todayFeedback,
    satisfactionRate,
    avgRatingScore,
    positiveFeedback,
    neutralFeedback,
    negativeFeedback,
    activeBranches,
    activeServices,
  } = overviewData;

  const positivePercentage =
    totalFeedback > 0
      ? Math.round((positiveFeedback / totalFeedback) * 100)
      : 0;
  const neutralPercentage =
    totalFeedback > 0 ? Math.round((neutralFeedback / totalFeedback) * 100) : 0;
  const negativePercentage =
    totalFeedback > 0
      ? Math.round((negativeFeedback / totalFeedback) * 100)
      : 0;

  const sentimentColor =
    satisfactionRate >= 75
      ? "emerald"
      : satisfactionRate >= 50
        ? "blue"
        : "amber";
  const sentimentIcon =
    satisfactionRate >= 75
      ? Smile
      : satisfactionRate >= 50
        ? TrendingUp
        : Activity;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your clinic today
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/analytics")}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* Hero Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 from-primary/5 to-primary/10 bg-gradient-to-br transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {totalFeedback.toLocaleString()}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  All-time submissions
                </p>
              </div>
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/20 bg-gradient-to-br from-emerald-50/50 to-emerald-100/20 transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-600">
                  {satisfactionRate}%
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {positiveFeedback.toLocaleString()} positive
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Smile className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/20 bg-gradient-to-br from-blue-50/50 to-blue-100/20 transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Today&apos;s Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {todayFeedback}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  New submissions
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-200/20 bg-gradient-to-br from-violet-50/50 to-violet-100/20 transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-violet-600">
                  {avgRatingScore.toFixed(1)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">out of 7.0</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Navigation */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="group cursor-pointer border-l-4 border-l-teal-500 transition-all hover:shadow-lg"
          onClick={() => router.push("/dashboard/branches")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600" />
                Clinic Branches
              </CardTitle>
              <Badge variant="secondary">{activeBranches} Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Manage and monitor all clinic locations with detailed performance
              metrics
            </p>
            <div className="flex items-center text-sm font-medium text-teal-600 transition-transform group-hover:translate-x-1">
              View Branches <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-l-4 border-l-blue-500 transition-all hover:shadow-lg"
          onClick={() => router.push("/dashboard/services")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Healthcare Services
              </CardTitle>
              <Badge variant="secondary">{activeServices} Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Oversee medical departments and service performance across all
              locations
            </p>
            <div className="flex items-center text-sm font-medium text-blue-600 transition-transform group-hover:translate-x-1">
              View Services <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-l-4 border-l-violet-500 transition-all hover:shadow-lg"
          onClick={() => router.push("/dashboard/feedback")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-violet-600" />
                Patient Feedback
              </CardTitle>
              <Badge variant="secondary">All Time</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Review and analyze patient feedback with advanced filtering and
              insights
            </p>
            <div className="flex items-center text-sm font-medium text-violet-600 transition-transform group-hover:translate-x-1">
              View Feedback <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Sentiment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-500" />
            Patient Experience Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Sentiment</span>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full",
                      sentimentColor === "emerald"
                        ? "bg-emerald-100 text-emerald-600"
                        : sentimentColor === "blue"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-amber-100 text-amber-600",
                    )}
                  >
                    {React.createElement(sentimentIcon, {
                      className: "h-4 w-4",
                    })}
                  </div>
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      sentimentColor === "emerald"
                        ? "text-emerald-600"
                        : sentimentColor === "blue"
                          ? "text-blue-600"
                          : "text-amber-600",
                    )}
                  >
                    {satisfactionRate}%
                  </span>
                </div>
              </div>

              <SatisfactionBar
                positive={positiveFeedback}
                neutral={neutralFeedback}
                negative={negativeFeedback}
                showLegend={true}
              />

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {positivePercentage}%
                  </p>
                  <p className="text-muted-foreground text-xs">Positive</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {neutralPercentage}%
                  </p>
                  <p className="text-muted-foreground text-xs">Neutral</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {negativePercentage}%
                  </p>
                  <p className="text-muted-foreground text-xs">Negative</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Quick Stats</h4>
              <div className="space-y-3">
                <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-teal-600" />
                    <span className="text-sm">Active Branches</span>
                  </div>
                  <span className="font-semibold">{activeBranches}</span>
                </div>
                <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Active Services</span>
                  </div>
                  <span className="font-semibold">{activeServices}</span>
                </div>
                <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-600" />
                    <span className="text-sm">Today&apos;s Feedback</span>
                  </div>
                  <span className="font-semibold">{todayFeedback}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Quick Links */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          onClick={() => router.push("/dashboard/analytics")}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm">Analytics</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          onClick={() => router.push("/dashboard/tasks")}
        >
          <Activity className="h-5 w-5" />
          <span className="text-sm">Tasks</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          onClick={() => router.push("/dashboard/appointments")}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-sm">Appointments</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          onClick={() => router.push("/dashboard/users")}
        >
          <Users className="h-5 w-5" />
          <span className="text-sm">Users</span>
        </Button>
      </div>
    </div>
  );
}
