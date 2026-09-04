"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  AlertCircle,
  Star,
  MessageSquare,
  ShieldAlert,
  Clock,
  ExternalLink,
  Sparkles,
  Building2,
  Stethoscope,
  Filter,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { ReviewsNav } from "@/hospital-admin/components/reviews/reviews-nav";
import { RespondReviewModal } from "@/hospital-admin/components/reviews/RespondReviewModal";
import { EscalateToGrievanceModal } from "@/hospital-admin/components/reviews/EscalateToGrievanceModal";
import {
  respondToReview,
  escalateReviewToGrievance,
} from "@/hospital-admin/store/slices/patientReviewsSlice";
import { PatientReviewItem } from "@/hospital-admin/lib/types/patient-reviews";
import { mockPatientReviews } from "@/hospital-admin/lib/mock-data/patient-reviews";

export default function UnansweredReviewsQueuePage() {
  const dispatch = useDispatch<AppDispatch>();
  const reviews = useSelector((s: RootState) => s.patientReviews?.reviews || mockPatientReviews);

  const [selectedReviewForResponse, setSelectedReviewForResponse] =
    useState<PatientReviewItem | null>(null);
  const [selectedReviewForEscalation, setSelectedReviewForEscalation] =
    useState<PatientReviewItem | null>(null);

  // Filter only unanswered reviews and sort with negative reviews (1★/2★) first
  const unansweredReviews = reviews
    .filter((r) => !r.responded)
    .sort((a, b) => {
      if (a.rating !== b.rating) {
        return a.rating - b.rating; // Lowest rating first
      }
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(); // Oldest first
    });

  const handleRespond = (reviewId: string, responseText: string, respondedBy: string) => {
    dispatch(respondToReview({ reviewId, responseText, respondedBy }));
  };

  const handleEscalate = (payload: Parameters<typeof escalateReviewToGrievance>[0]) => {
    dispatch(escalateReviewToGrievance(payload));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                Response SLA Queue
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Unanswered Reviews & Grievance Triage Queue
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Prioritized response queue surfacing 1★ & 2★ critical patient feedback first for prompt hospital reply and escalation.
            </p>
          </div>

          <Badge variant="destructive" className="text-xs h-7 px-3 gap-1 self-start md:self-auto">
            <AlertCircle className="h-3.5 w-3.5" />
            {unansweredReviews.length} Reviews Pending Response
          </Badge>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ReviewsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {unansweredReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3 bg-muted/20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">All Patient Reviews Responded!</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your hospital response queue is completely clear. No pending reviews require administrative reply.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unansweredReviews.map((rev) => {
              const isCritical = rev.rating <= 2;

              return (
                <Card
                  key={rev.id}
                  className={`border-border/80 shadow-sm bg-card transition-all ${
                    isCritical ? "border-rose-500/40 ring-1 ring-rose-500/20" : ""
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isCritical ? "destructive" : "outline"}
                          className="text-[10px]"
                        >
                          {rev.source}
                        </Badge>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
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
                        {isCritical && (
                          <Badge variant="destructive" className="text-[10px] animate-pulse">
                            Priority Response SLA
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Submitted: {rev.submittedAt}</span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed font-sans">
                      &ldquo;{rev.reviewText}&rdquo;
                    </p>

                    {/* Department & Doctor Link Info */}
                    {(rev.linkedDoctorName || rev.linkedDepartmentName || rev.tags.length > 0) && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {rev.linkedDoctorName && (
                            <div className="flex items-center gap-1 font-medium text-foreground">
                              <Stethoscope className="h-3.5 w-3.5 text-primary" />
                              <span>{rev.linkedDoctorName}</span>
                            </div>
                          )}
                          {rev.linkedDepartmentName && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>{rev.linkedDepartmentName}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1">
                          {rev.tags.map((t) => (
                            <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                      <div className="text-[11px] text-muted-foreground">
                        {rev.googleReviewUrl && (
                          <a
                            href={rev.googleReviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open on Google
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isCritical && !rev.isEscalatedToGrievance && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReviewForEscalation(rev)}
                            className="h-7 text-xs gap-1 border-rose-500/40 text-rose-600 hover:bg-rose-500/10 font-medium"
                          >
                            <ShieldAlert className="h-3 w-3" />
                            Escalate to Grievance Case
                          </Button>
                        )}

                        {rev.isEscalatedToGrievance && (
                          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
                            Grievance Case: {rev.grievanceCaseId}
                          </Badge>
                        )}

                        <Button
                          size="sm"
                          onClick={() => setSelectedReviewForResponse(rev)}
                          className="h-7 text-xs gap-1 bg-primary text-primary-foreground font-medium"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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
    </div>
  );
}
