import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity, Building2, Star, TrendingUp, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Minus, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { SatisfactionBar } from "@/components/dashboard/satisfaction-bar";
import { FeedbackTrendChart } from "@/components/dashboard/feedback-trend-chart";
import Link from "next/link";
import { getServiceIcon } from "@/lib/services/icons";

interface ServiceDetailData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  totalFeedback: number;
  satisfactionRate: number;
  avgScore: number;
  positive: number;
  neutral: number;
  negative: number;
  branches: Array<{
    id: string;
    name: string;
    satisfactionRate: number;
    avgScore: number;
    totalFeedback: number;
  }>;
  recentFeedback: Array<{
    id: string;
    branchName: string;
    rating: string;
    comment: string | null;
    createdAt: Date;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  weeklyTrends: Array<{
    date: string;
    count: number;
    satisfactionRate: number;
  }>;
}

export const metadata: Metadata = {
  title: "Service Details",
  description: "Detailed view of medical service performance and analytics.",
};

export const dynamic = "force-dynamic";

async function getServiceDetailData(serviceId: string): Promise<ServiceDetailData | null> {
  const service = await db.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
    },
  });

  if (!service) return null;

  // Get feedback statistics for this service
  const feedbackStats = await db.feedback.groupBy({
    by: ["rating"],
    where: { 
      serviceId,
      deletedAt: null,
    },
    _count: { _all: true },
  });

  let totalFeedback = 0;
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let totalScore = 0;

  const { getRatingScore, isPositiveRating, isNeutralRating } = await import("@/lib/feedback/ratings");

  for (const stat of feedbackStats) {
    const count = stat._count._all;
    totalFeedback += count;
    totalScore += getRatingScore(stat.rating as any) * count;
    if (isPositiveRating(stat.rating as any)) positive += count;
    else if (isNeutralRating(stat.rating as any)) neutral += count;
    else negative += count;
  }

  const satisfactionRate = totalFeedback > 0 ? Math.round((positive / totalFeedback) * 100) : 0;
  const avgScore = totalFeedback > 0 ? Math.round((totalScore / totalFeedback) * 10) / 10 : 0;

  // Get branches that offer this service with their analytics
  const branchServices = await db.branchService.findMany({
    where: { 
      serviceId,
      isActive: true,
    },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const branchIds = branchServices.map(bs => bs.branchId);

  const branchStats = await db.feedback.groupBy({
    by: ["branchId", "rating"],
    where: { 
      serviceId,
      branchId: { in: branchIds },
      deletedAt: null,
    },
    _count: { _all: true },
  });

  const branchAnalytics = new Map<string, any>();
  for (const stat of branchStats) {
    const existing = branchAnalytics.get(stat.branchId) || {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      score: 0,
    };
    const count = stat._count._all;
    existing.total += count;
    existing.score += getRatingScore(stat.rating as any) * count;
    if (isPositiveRating(stat.rating as any)) existing.positive += count;
    else if (isNeutralRating(stat.rating as any)) existing.neutral += count;
    else existing.negative += count;
    branchAnalytics.set(stat.branchId, existing);
  }

  const branches = branchServices.map(bs => {
    const stats = branchAnalytics.get(bs.branchId) || { total: 0, positive: 0, neutral: 0, negative: 0, score: 0 };
    const branchTotal = stats.total;
    const branchSatisfaction = branchTotal > 0 ? Math.round((stats.positive / branchTotal) * 100) : 0;
    const branchAvgScore = branchTotal > 0 ? Math.round((stats.score / branchTotal) * 10) / 10 : 0;
    
    return {
      id: bs.branch.id,
      name: bs.branch.name,
      satisfactionRate: branchSatisfaction,
      avgScore: branchAvgScore,
      totalFeedback: branchTotal,
    };
  }).sort((a, b) => b.totalFeedback - a.totalFeedback);

  // Get recent feedback
  const recentFeedback = await db.feedback.findMany({
    where: { 
      serviceId,
      deletedAt: null,
    },
    include: {
      branch: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const recentFeedbackWithSentiment = recentFeedback.map(fb => {
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (isPositiveRating(fb.rating as any)) sentiment = 'positive';
    else if (!isNeutralRating(fb.rating as any)) sentiment = 'negative';

    return {
      id: fb.id,
      branchName: fb.branch.name,
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
      serviceId,
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
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const dayFeedback = weeklyFeedback.filter(fb => 
      fb.createdAt >= dayStart && fb.createdAt <= dayEnd
    );

    const dayCount = dayFeedback.length;
    let dayPositive = 0;
    let dayScore = 0;

    for (const fb of dayFeedback) {
      dayScore += getRatingScore(fb.rating as any);
      if (isPositiveRating(fb.rating as any)) dayPositive++;
    }

    const daySatisfaction = dayCount > 0 ? Math.round((dayPositive / dayCount) * 100) : 0;

    weeklyTrends.push({
      date: dateStr,
      count: dayCount,
      satisfactionRate: daySatisfaction,
    });
  }

  return {
    ...service,
    totalFeedback,
    satisfactionRate,
    avgScore,
    positive,
    neutral,
    negative,
    branches,
    recentFeedback: recentFeedbackWithSentiment,
    weeklyTrends,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.SERVICE_READ);
  
  const { id } = await params;
  const serviceData = await getServiceDetailData(id);
  
  if (!serviceData) {
    notFound();
  }

  const Icon = getServiceIcon(serviceData.name);

  const positivePercentage = serviceData.totalFeedback > 0 
    ? Math.round((serviceData.positive / serviceData.totalFeedback) * 100) 
    : 0;
  const neutralPercentage = serviceData.totalFeedback > 0 
    ? Math.round((serviceData.neutral / serviceData.totalFeedback) * 100) 
    : 0;
  const negativePercentage = serviceData.totalFeedback > 0 
    ? Math.round((serviceData.negative / serviceData.totalFeedback) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/services">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{serviceData.name}</h1>
              <p className="text-muted-foreground">Service Performance Dashboard</p>
            </div>
          </div>
        </div>
        <Badge variant={serviceData.isActive ? "default" : "secondary"}>
          {serviceData.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Service Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-lg font-semibold">{serviceData.description || "No description available"}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">{serviceData.avgScore.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">out of 7.0</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>+0.1 this month</span>
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Feedback</span>
                <span className="text-2xl font-bold">{serviceData.totalFeedback.toLocaleString()}</span>
              </div>
              <SatisfactionBar
                positive={serviceData.positive}
                neutral={serviceData.neutral}
                negative={serviceData.negative}
                showLegend={true}
              />
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{positivePercentage}%</p>
                  <p className="text-xs text-muted-foreground">Positive</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{neutralPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Neutral</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{negativePercentage}%</p>
                  <p className="text-xs text-muted-foreground">Negative</p>
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
          <FeedbackTrendChart data={serviceData.weeklyTrends} />
        </CardContent>
      </Card>

      {/* Branches Offering This Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branches Offering This Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceData.branches.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No branches currently offering this service.</p>
            ) : (
              serviceData.branches.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                  <div className="flex-1">
                    <h3 className="font-semibold">{branch.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{branch.avgScore.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">/ 7.0</span>
                      </div>
                      <span className="text-muted-foreground text-sm">{branch.totalFeedback} reviews</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{branch.satisfactionRate}%</p>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Service Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Service Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceData.recentFeedback.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent feedback available.</p>
            ) : (
              serviceData.recentFeedback.map((feedback) => (
                <div key={feedback.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{feedback.branchName}</Badge>
                        <div className="flex items-center gap-1">
                          {feedback.sentiment === 'positive' && <ThumbsUp className="h-4 w-4 text-emerald-600" />}
                          {feedback.sentiment === 'neutral' && <Minus className="h-4 w-4 text-gray-600" />}
                          {feedback.sentiment === 'negative' && <ThumbsDown className="h-4 w-4 text-red-600" />}
                          <span className="text-sm font-medium capitalize">{feedback.sentiment}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{feedback.rating}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {feedback.comment && (
                    <p className="text-sm mt-2 p-3 bg-muted/50 rounded">{feedback.comment}</p>
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