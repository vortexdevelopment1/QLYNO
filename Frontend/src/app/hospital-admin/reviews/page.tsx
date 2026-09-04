"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Star,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  RefreshCw,
  Send,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Phone,
  UserCheck,
  Building2,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { ReviewsNav } from "@/hospital-admin/components/reviews/reviews-nav";
import { RespondReviewModal } from "@/hospital-admin/components/reviews/RespondReviewModal";
import { EscalateToGrievanceModal } from "@/hospital-admin/components/reviews/EscalateToGrievanceModal";
import { DispatchSurveyModal } from "@/hospital-admin/components/reviews/DispatchSurveyModal";
import { CreateGrievanceModal } from "@/hospital-admin/components/reviews/CreateGrievanceModal";
import {
  respondToReview,
  escalateReviewToGrievance,
  createGrievanceCase,
  addNpsSurveyResponse,
  syncGoogleReviewsStart,
  syncGoogleReviewsSuccess,
} from "@/hospital-admin/store/slices/patientReviewsSlice";
import { PatientReviewItem, GrievanceCase, NPSSurveyResponse } from "@/hospital-admin/lib/types/patient-reviews";
import {
  mockPatientReviews,
  mockGrievanceCases,
  mockReviewAnalyticsSummary,
} from "@/hospital-admin/lib/mock-data/patient-reviews";

export default function ReviewsOverviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const reviews = useSelector((s: RootState) => s.patientReviews?.reviews || mockPatientReviews);
  const grievances = useSelector((s: RootState) => s.patientReviews?.grievances || mockGrievanceCases);
  const analytics = useSelector((s: RootState) => s.patientReviews?.analytics || mockReviewAnalyticsSummary);
  const isSyncingGoogle = useSelector((s: RootState) => s.patientReviews?.isSyncingGoogle ?? false);
  const lastSyncedAt = useSelector((s: RootState) => s.patientReviews?.lastSyncedAt || "2026-08-30 14:00");

  const [selectedReviewForResponse, setSelectedReviewForResponse] =
    useState<PatientReviewItem | null>(null);
  const [selectedReviewForEscalation, setSelectedReviewForEscalation] =
    useState<PatientReviewItem | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isCreateGrievanceOpen, setIsCreateGrievanceOpen] = useState(false);

  const unansweredReviews = reviews.filter((r) => !r.responded);
  const activeGrievances = grievances.filter((g) => g.status !== "Resolved");

  const handleSyncGoogle = () => {
    dispatch(syncGoogleReviewsStart());
    setTimeout(() => {
      dispatch(syncGoogleReviewsSuccess());
    }, 1200);
  };

  const handleRespond = (reviewId: string, responseText: string, respondedBy: string) => {
    dispatch(respondToReview({ reviewId, responseText, respondedBy }));
  };

  const handleEscalate = (payload: Parameters<typeof escalateReviewToGrievance>[0]) => {
    dispatch(escalateReviewToGrievance(payload));
  };

  const handleCreateGrievance = (grievance: GrievanceCase) => {
    dispatch(createGrievanceCase(grievance));
  };

  const handleDispatchSurvey = (survey: NPSSurveyResponse) => {
    dispatch(addNpsSurveyResponse(survey));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Hospital Growth & Quality
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Patient Feedback & Satisfaction Workstation
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Single source of truth for Net Promoter Score (NPS), Google Reviews sync, grievance resolution, and physician rating scorecards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncGoogle}
              disabled={isSyncingGoogle}
              className="h-8 gap-1 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingGoogle ? "animate-spin text-primary" : ""}`} />
              {isSyncingGoogle ? "Syncing Google..." : "Sync Google Reviews"}
            </Button>

            <Button
              size="sm"
              onClick={() => setIsDispatchModalOpen(true)}
              className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Dispatch NPS Survey (F23)
            </Button>

            <Button
              size="sm"
              onClick={() => setIsCreateGrievanceOpen(true)}
              className="h-8 gap-1 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Grievance
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ReviewsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* KPI Ribbons */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Hospital Average Rating */}
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
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[10px] text-muted-foreground font-mono ml-1">
                    ({analytics.totalReviewsCount})
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Net Promoter Score */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Net Promoter Score (NPS)</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    +{analytics.npsScore}
                  </span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Excellent
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {analytics.npsPromotersPercent}% Promoters • {analytics.npsDetractorsPercent}% Detractors
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Unanswered Response Queue */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Unanswered Reviews</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {unansweredReviews.length}
                  </span>
                  {unansweredReviews.length > 0 && (
                    <Badge variant="destructive" className="text-[9px]">
                      Action Req.
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Avg. SLA: {analytics.averageResponseTimeHours} hrs
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Active Grievances */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Active Grievances</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {activeGrievances.length}
                  </span>
                  <Badge variant="outline" className="text-[9px] border-rose-500/30 text-rose-600">
                    Module 16 Escalated
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {grievances.filter((g) => g.isOverdue).length} Overdue SLA cases
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Google Sync Status */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Google Business Profile</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">Live Synced</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  Last: {lastSyncedAt}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <RefreshCw className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mid-Row: NPS Distribution & Sentiment Matrix */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* NPS Breakdown Card */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Inpatient Post-Discharge NPS</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Score: +{analytics.npsScore}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Dispatched via F23 WhatsApp upon F5 Discharge events.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {/* Stacked Progress Bar */}
              <div className="h-3.5 w-full rounded-full bg-muted flex overflow-hidden">
                <div
                  style={{ width: `${analytics.npsPromotersPercent}%` }}
                  className="bg-emerald-500 transition-all"
                  title={`Promoters: ${analytics.npsPromotersPercent}%`}
                />
                <div
                  style={{ width: `${analytics.npsPassivesPercent}%` }}
                  className="bg-amber-400 transition-all"
                  title={`Passives: ${analytics.npsPassivesPercent}%`}
                />
                <div
                  style={{ width: `${analytics.npsDetractorsPercent}%` }}
                  className="bg-rose-500 transition-all"
                  title={`Detractors: ${analytics.npsDetractorsPercent}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Promoters (9-10)</span>
                  <span className="text-base font-bold text-emerald-600">{analytics.npsPromotersPercent}%</span>
                </div>
                <div className="rounded border border-amber-500/20 bg-amber-500/5 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Passives (7-8)</span>
                  <span className="text-base font-bold text-amber-600">{analytics.npsPassivesPercent}%</span>
                </div>
                <div className="rounded border border-rose-500/20 bg-rose-500/5 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Detractors (0-6)</span>
                  <span className="text-base font-bold text-rose-600">{analytics.npsDetractorsPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Sentiment Breakdown */}
          <Card className="border-border/80 shadow-sm bg-card lg:col-span-2">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Operational Sentiment by Hospital Touchpoint</span>
                <span className="text-xs text-muted-foreground font-normal">82% Positive Overall</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Extracted from patient comments across Google, Surveys, and Portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2.5">
              {analytics.categorySentiment.map((item) => (
                <div key={item.category} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-foreground">{item.category}</span>
                    <span className="font-mono text-emerald-600 font-semibold">{item.positivePercent}% Positive</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted flex overflow-hidden">
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

        {/* Live Patient Reviews Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Recent Patient Feedback Stream
              </h3>
              <p className="text-xs text-muted-foreground">
                Unified live feed across Google Reviews, Post-Discharge Surveys, and In-App Portal.
              </p>
            </div>

            <Badge variant="outline" className="text-xs">
              Showing Latest {reviews.slice(0, 5).length} of {reviews.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {reviews.slice(0, 5).map((rev) => (
              <Card key={rev.id} className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {rev.source}
                      </Badge>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {rev.patientName}
                      </span>
                      {rev.sentiment === "Negative" && (
                        <Badge variant="destructive" className="text-[10px]">
                          Negative Feedback
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{rev.submittedAt}</span>
                      {rev.responded ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Responded
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-rose-600 border-rose-500/30 text-[10px]">
                          Pending Reply
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    &ldquo;{rev.reviewText}&rdquo;
                  </p>

                  {/* Doctor & Dept Attribution */}
                  {(rev.linkedDoctorName || rev.linkedDepartmentName || rev.tags.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-border/60">
                      {rev.linkedDoctorName && (
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <Stethoscope className="h-3.5 w-3.5 text-primary" />
                          <span>{rev.linkedDoctorName}</span>
                        </div>
                      )}
                      {rev.linkedDepartmentName && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{rev.linkedDepartmentName}</span>
                        </div>
                      )}
                      <div className="flex gap-1 ml-auto">
                        {rev.tags.map((t) => (
                          <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Published Hospital Response */}
                  {rev.responded && rev.responseText && (
                    <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-primary">
                        <span>Hospital Response ({rev.respondedBy})</span>
                        <span className="text-muted-foreground font-mono">{rev.respondedAt}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{rev.responseText}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {!rev.responded && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedReviewForResponse(rev)}
                        className="h-7 text-xs gap-1 bg-primary text-primary-foreground"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Reply to Review
                      </Button>
                    )}

                    {rev.rating <= 2 && !rev.isEscalatedToGrievance && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReviewForEscalation(rev)}
                        className="h-7 text-xs gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                      >
                        <ShieldAlert className="h-3 w-3" />
                        Escalate to Grievance
                      </Button>
                    )}

                    {rev.isEscalatedToGrievance && (
                      <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
                        Grievance Case: {rev.grievanceCaseId}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RespondReviewModal
        isOpen={!!selectedReviewForResponse}
        onClose={() => setSelectedReviewForResponse(null)}
        review={selectedReviewForResponse}
        onRespond={handleRespond}
      />

      <EscalateToGrievanceModal
        isOpen={!!selectedReviewForEscalation}
        onClose={() => setSelectedReviewForEscalation(null)}
        review={selectedReviewForEscalation}
        onEscalate={handleEscalate}
      />

      <DispatchSurveyModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onDispatch={handleDispatchSurvey}
      />

      <CreateGrievanceModal
        isOpen={isCreateGrievanceOpen}
        onClose={() => setIsCreateGrievanceOpen(false)}
        onCreate={handleCreateGrievance}
      />
    </div>
  );
}
