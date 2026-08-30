import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  Calendar,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import type { FeedbackRating } from "@/lib/feedback/types";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { SatisfactionBar } from "@/components/dashboard/satisfaction-bar";
import { FeedbackTrendChart } from "@/components/dashboard/feedback-trend-chart";
import Link from "next/link";

interface BranchDetailData {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  totalFeedback: number;
  satisfactionRate: number;
  avgScore: number;
  positive: number;
  neutral: number;
  negative: number;
  services: Array<{
    id: string;
    name: string;
    satisfactionRate: number;
    avgScore: number;
    totalFeedback: number;
  }>;
  recentFeedback: Array<{
    id: string;
    serviceName: string;
    rating: string;
    comment: string | null;
    createdAt: Date;
    sentiment: "positive" | "neutral" | "negative";
  }>;
  weeklyTrends: Array<{
    date: string;
    count: number;
    satisfactionRate: number;
  }>;
}

export const metadata: Metadata = {
  title: "Branch Details",
  description: "Detailed view of clinic branch performance and analytics.",
};

export const dynamic = "force-dynamic";

async function getBranchDetailData(
  branchId: string,
): Promise<BranchDetailData | null> {
  const branch = await db.branch.findUnique({
    where: { id: branchId },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      phone: true,
      isActive: true,
    },
  });

  if (!branch) return null;

  // Get feedback statistics for this branch
  const feedbackStats = await db.feedback.groupBy({
    by: ["rating"],
    where: {
      branchId,
      deletedAt: null,
    },
    _count: { _all: true },
  });

  let totalFeedback = 0;
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let totalScore = 0;

  const { getRatingScore, isPositiveRating, isNeutralRating } =
    await import("@/lib/feedback/ratings");

  for (const stat of feedbackStats) {
    const count = stat._count._all;
    totalFeedback += count;
    totalScore += getRatingScore(stat.rating as FeedbackRating) * count;
    if (isPositiveRating(stat.rating as FeedbackRating)) positive += count;
    else if (isNeutralRating(stat.rating as FeedbackRating)) neutral += count;
    else negative += count;
  }

  const satisfactionRate =
    totalFeedback > 0 ? Math.round((positive / totalFeedback) * 100) : 0;
  const avgScore =
    totalFeedback > 0 ? Math.round((totalScore / totalFeedback) * 10) / 10 : 0;

  // Get services offered at this branch with their analytics
  const branchServices = await db.branchService.findMany({
    where: {
      branchId,
      isActive: true,
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const serviceIds = branchServices.map((bs) => bs.serviceId);

  const serviceStats = await db.feedback.groupBy({
    by: ["serviceId", "rating"],
    where: {
      branchId,
      serviceId: { in: serviceIds },
      deletedAt: null,
    },
    _count: { _all: true },
  });

  const serviceAnalytics = new Map<
    string,
    {
      total: number;
      positive: number;
      neutral: number;
      negative: number;
      score: number;
    }
  >();
  for (const stat of serviceStats) {
    const existing = serviceAnalytics.get(stat.serviceId) || {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      score: 0,
    };
    const count = stat._count._all;
    existing.total += count;
    existing.score += getRatingScore(stat.rating as FeedbackRating) * count;
    if (isPositiveRating(stat.rating as FeedbackRating))
      existing.positive += count;
    else if (isNeutralRating(stat.rating as FeedbackRating))
      existing.neutral += count;
    else existing.negative += count;
    serviceAnalytics.set(stat.serviceId, existing);
  }

  const services = branchServices
    .map((bs) => {
      const stats = serviceAnalytics.get(bs.serviceId) || {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        score: 0,
      };
      const serviceTotal = stats.total;
      const serviceSatisfaction =
        serviceTotal > 0
          ? Math.round((stats.positive / serviceTotal) * 100)
          : 0;
      const serviceAvgScore =
        serviceTotal > 0
          ? Math.round((stats.score / serviceTotal) * 10) / 10
          : 0;

      return {
        id: bs.service.id,
        name: bs.service.name,
        satisfactionRate: serviceSatisfaction,
        avgScore: serviceAvgScore,
        totalFeedback: serviceTotal,
      };
    })
    .sort((a, b) => b.totalFeedback - a.totalFeedback);

  // Get recent feedback
  const recentFeedback = await db.feedback.findMany({
    where: {
      branchId,
      deletedAt: null,
    },
    include: {
      service: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentFeedbackWithSentiment = recentFeedback.map((fb) => {
    let sentiment: "positive" | "neutral" | "negative" = "neutral";
    if (isPositiveRating(fb.rating as FeedbackRating)) sentiment = "positive";
    else if (!isNeutralRating(fb.rating as FeedbackRating))
      sentiment = "negative";

    return {
      id: fb.id,
      serviceName: fb.service.name,
      rating: fb.rating,
      comment: fb.comment,
      createdAt: fb.createdAt,
      sentiment,
    };
  });

  // Get weekly trends (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyFeedback = await db.feedback.findMany({
    where: {
      branchId,
      deletedAt: null,
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      rating: true,
      createdAt: true,
    },
  });

  const weeklyTrends = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const dayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const dayEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );

    const dayFeedback = weeklyFeedback.filter(
      (fb) => fb.createdAt >= dayStart && fb.createdAt <= dayEnd,
    );

    const dayCount = dayFeedback.length;
    let dayPositive = 0;

    for (const fb of dayFeedback) {
      if (isPositiveRating(fb.rating as FeedbackRating)) dayPositive++;
    }

    const daySatisfaction =
      dayCount > 0 ? Math.round((dayPositive / dayCount) * 100) : 0;

    weeklyTrends.push({
      date: dateStr,
      count: dayCount,
      satisfactionRate: daySatisfaction,
    });
  }

  return {
    ...branch,
    totalFeedback,
    satisfactionRate,
    avgScore,
    positive,
    neutral,
    negative,
    services,
    recentFeedback: recentFeedbackWithSentiment,
    weeklyTrends,
  };
}

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.BRANCH_READ);

  const { id } = await params;
  const branchData = await getBranchDetailData(id);

  if (!branchData) {
    notFound();
  }

  const positivePercentage =
    branchData.totalFeedback > 0
      ? Math.round((branchData.positive / branchData.totalFeedback) * 100)
      : 0;
  const neutralPercentage =
    branchData.totalFeedback > 0
      ? Math.round((branchData.neutral / branchData.totalFeedback) * 100)
      : 0;
  const negativePercentage =
    branchData.totalFeedback > 0
      ? Math.round((branchData.negative / branchData.totalFeedback) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/branches">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Branches
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{branchData.name}</h1>
          <p className="text-muted-foreground">Branch Performance Dashboard</p>
        </div>
        <Badge variant={branchData.isActive ? "default" : "secondary"}>
          {branchData.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Branch Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branch Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Branch Code
              </p>
              <p className="text-lg font-semibold">
                {branchData.code || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Address
              </p>
              <p className="text-lg font-semibold">
                {branchData.address || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                <Phone className="h-4 w-4" />
                Phone
              </p>
              <p className="text-lg font-semibold">
                {branchData.phone || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Satisfaction Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Overall Satisfaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <p className="text-primary text-5xl font-bold">
                {branchData.avgScore.toFixed(1)}
              </p>
              <p className="text-muted-foreground text-sm">out of 7.0</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>+0.2 this month</span>
              </div>
            </div>
            <div className="col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Total Feedback</span>
                <span className="text-2xl font-bold">
                  {branchData.totalFeedback.toLocaleString()}
                </span>
              </div>
              <SatisfactionBar
                positive={branchData.positive}
                neutral={branchData.neutral}
                negative={branchData.negative}
                showLegend={true}
              />
              <div className="mt-4 grid grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Feedback Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Feedback Trends (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackTrendChart data={branchData.weeklyTrends} />
        </CardContent>
      </Card>

      {/* Services Offered */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Services Offered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {branchData.services.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No services currently offered at this branch.
              </p>
            ) : (
              branchData.services.map((service) => (
                <div
                  key={service.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">
                          {service.avgScore.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          / 7.0
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {service.totalFeedback} reviews
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary text-2xl font-bold">
                      {service.satisfactionRate}%
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Satisfaction
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Branch Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Branch Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branchData.recentFeedback.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No recent feedback available.
              </p>
            ) : (
              branchData.recentFeedback.map((feedback) => (
                <div key={feedback.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="outline">{feedback.serviceName}</Badge>
                        <div className="flex items-center gap-1">
                          {feedback.sentiment === "positive" && (
                            <ThumbsUp className="h-4 w-4 text-emerald-600" />
                          )}
                          {feedback.sentiment === "neutral" && (
                            <Minus className="h-4 w-4 text-gray-600" />
                          )}
                          {feedback.sentiment === "negative" && (
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium capitalize">
                            {feedback.sentiment}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {feedback.rating}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {feedback.comment && (
                    <p className="bg-muted/50 mt-2 rounded p-3 text-sm">
                      {feedback.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
