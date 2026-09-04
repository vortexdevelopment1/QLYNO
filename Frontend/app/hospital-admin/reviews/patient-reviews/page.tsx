"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Search,
  Star,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Filter,
  ExternalLink,
  Stethoscope,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
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

export default function PatientReviewsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const reviews = useSelector((s: RootState) => s.patientReviews?.reviews || mockPatientReviews);

  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [respondedFilter, setRespondedFilter] = useState("all");

  const [selectedReviewForResponse, setSelectedReviewForResponse] =
    useState<PatientReviewItem | null>(null);
  const [selectedReviewForEscalation, setSelectedReviewForEscalation] =
    useState<PatientReviewItem | null>(null);

  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rev.linkedDoctorName && rev.linkedDoctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rev.linkedDepartmentName &&
        rev.linkedDepartmentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSource =
      sourceFilter === "all" || rev.source.toLowerCase() === sourceFilter.toLowerCase();

    const matchesRating =
      ratingFilter === "all" || rev.rating.toString() === ratingFilter;

    const matchesResponded =
      respondedFilter === "all" ||
      (respondedFilter === "responded" && rev.responded) ||
      (respondedFilter === "pending" && !rev.responded);

    return matchesSearch && matchesSource && matchesRating && matchesResponded;
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
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Unified Feed
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Patient Reviews & Multi-Source Feedback Inbox
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage synced Google Business reviews and post-discharge internal patient survey responses in a single inbox.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ReviewsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Search & Multi-Filter Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, review text, doctor, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Source Filter */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={sourceFilter === "all" ? "default" : "outline"}
                onClick={() => setSourceFilter("all")}
                className="h-8 text-xs"
              >
                All Sources ({reviews.length})
              </Button>
              <Button
                size="sm"
                variant={sourceFilter === "google" ? "default" : "outline"}
                onClick={() => setSourceFilter("google")}
                className="h-8 text-xs"
              >
                Google
              </Button>
              <Button
                size="sm"
                variant={sourceFilter === "post-discharge survey" ? "default" : "outline"}
                onClick={() => setSourceFilter("post-discharge survey")}
                className="h-8 text-xs"
              >
                Surveys
              </Button>
              <Button
                size="sm"
                variant={sourceFilter === "portal app" ? "default" : "outline"}
                onClick={() => setSourceFilter("portal app")}
                className="h-8 text-xs"
              >
                Portal
              </Button>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-1">
              {["all", "5", "4", "3", "2", "1"].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={ratingFilter === r ? "default" : "outline"}
                  onClick={() => setRatingFilter(r)}
                  className="h-8 text-xs px-2.5"
                >
                  {r === "all" ? "All Stars" : `${r}★`}
                </Button>
              ))}
            </div>

            {/* Responded Status */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={respondedFilter === "pending" ? "default" : "outline"}
                onClick={() => setRespondedFilter(respondedFilter === "pending" ? "all" : "pending")}
                className="h-8 text-xs"
              >
                Unanswered Only
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {filteredReviews.map((rev) => (
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
                    {rev.patientId && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ({rev.patientId})
                      </span>
                    )}
                    {rev.sentiment === "Negative" && (
                      <Badge variant="destructive" className="text-[10px]">
                        Critical Attention
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

                <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                  &ldquo;{rev.reviewText}&rdquo;
                </p>

                {/* Attribution & Tags */}
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

                {/* Response Display Box */}
                {rev.responded && rev.responseText && (
                  <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-primary">
                      <span>Hospital Official Response ({rev.respondedBy})</span>
                      <span className="text-muted-foreground font-mono text-[10px]">{rev.respondedAt}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{rev.responseText}</p>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                  <div className="flex items-center gap-2">
                    {rev.googleReviewUrl && (
                      <a
                        href={rev.googleReviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on Google Maps
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!rev.responded && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedReviewForResponse(rev)}
                        className="h-7 text-xs gap-1 bg-primary text-primary-foreground"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Post Response
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
                        Escalate to Grievance Case
                      </Button>
                    )}

                    {rev.isEscalatedToGrievance && (
                      <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
                        Grievance Case: {rev.grievanceCaseId}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
    </div>
  );
}
