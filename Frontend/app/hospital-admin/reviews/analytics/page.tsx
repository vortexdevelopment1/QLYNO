"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  TrendingUp,
  Star,
  Clock,
  ThumbsUp,
  Smile,
  Frown,
  Meh,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { ReviewsNav } from "@/hospital-admin/components/reviews/reviews-nav";
import { mockReviewAnalyticsSummary } from "@/hospital-admin/lib/mock-data/patient-reviews";

export default function ReviewAnalyticsPage() {
  const analytics = useSelector((s: RootState) => s.patientReviews?.analytics || mockReviewAnalyticsSummary);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Single Source of Truth
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Patient Feedback & NPS Analytics
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Computes canonical Net Promoter Score (NPS), sentiment trajectories, and response SLAs feeding Analytics Executive (F21) Cockpit.
            </p>
          </div>

          <Badge variant="outline" className="text-xs h-7 px-3 gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Feeds F21 Executive Cockpit
          </Badge>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ReviewsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Hospital Rating</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {analytics.hospitalAverageRating}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Across {analytics.totalReviewsCount} Reviews
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Star className="h-5 w-5 fill-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Net Promoter Score</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    +{analytics.npsScore}
                  </span>
                  <span className="text-xs text-muted-foreground">NPS</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  +10 improvement since Jan 2026
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Avg Response Time</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {analytics.averageResponseTimeHours}
                  </span>
                  <span className="text-xs text-muted-foreground">hours</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  SLA Target: &lt; 6.0 hours
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Response Rate</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {analytics.responseRatePercent}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {analytics.unansweredCount} currently pending
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <ThumbsUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mid Row: 8-Month Trajectories */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Rating Trajectory */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Monthly Rating Trajectory (Jan - Aug 2026)</span>
                <Badge variant="outline" className="text-[10px]">
                  Steady Upward Trend
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly average satisfaction score from 140 to 202 reviews/month.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-2 pt-2">
                {analytics.monthlyRatingTrend.map((m) => (
                  <div key={m.month} className="space-y-0.5 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-foreground">{m.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">({m.reviewCount} reviews)</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{m.rating}★</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        style={{ width: `${(m.rating / 5) * 100}%` }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly NPS Trajectory */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Net Promoter Score Trajectory (+58 ➔ +68)</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                  +10 Points
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Computed from verified inpatient discharge WhatsApp surveys.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-2 pt-2">
                {analytics.monthlyNpsTrend.map((m) => (
                  <div key={m.month} className="space-y-0.5 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-foreground">{m.month}</span>
                      <span className="font-bold text-emerald-600 font-mono">+{m.nps} NPS</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        style={{ width: `${m.nps}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Distribution Matrix */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Overall Sentiment Distribution */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">
                Sentiment Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Across 1,420 total processed feedback entries.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="space-y-2.5">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smile className="h-5 w-5 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-xs text-foreground block">Positive Sentiment</span>
                      <span className="text-[10px] text-muted-foreground">{analytics.sentimentBreakdown[0].count} Reviews</span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-emerald-600">{analytics.sentimentBreakdown[0].percentage}%</span>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Meh className="h-5 w-5 text-amber-600" />
                    <div>
                      <span className="font-semibold text-xs text-foreground block">Neutral Sentiment</span>
                      <span className="text-[10px] text-muted-foreground">{analytics.sentimentBreakdown[1].count} Reviews</span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-amber-600">{analytics.sentimentBreakdown[1].percentage}%</span>
                </div>

                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Frown className="h-5 w-5 text-rose-600" />
                    <div>
                      <span className="font-semibold text-xs text-foreground block">Negative Sentiment</span>
                      <span className="text-[10px] text-muted-foreground">{analytics.sentimentBreakdown[2].count} Reviews</span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-rose-600">{analytics.sentimentBreakdown[2].percentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Touchpoint Operational Quality */}
          <Card className="border-border/80 shadow-sm bg-card lg:col-span-2">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">
                Touchpoint Sentiment & Friction Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Identifies high-satisfaction drivers versus operational bottlenecks.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {analytics.categorySentiment.map((item) => (
                <div key={item.category} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-foreground">{item.category}</span>
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-semibold">{item.positivePercent}% Pos</span>
                      <span className="text-rose-600 font-semibold">{item.negativePercent}% Neg</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted flex overflow-hidden">
                    <div
                      style={{ width: `${item.positivePercent}%` }}
                      className="bg-emerald-500 rounded-l-full"
                    />
                    <div
                      style={{ width: `${item.negativePercent}%` }}
                      className="bg-rose-500 rounded-r-full"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
