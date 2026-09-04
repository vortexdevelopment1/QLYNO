"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Star,
  Building2,
  Stethoscope,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { ReviewsNav } from "@/hospital-admin/components/reviews/reviews-nav";

import {
  mockDoctorScorecards,
  mockDepartmentScorecards,
  mockReviewAnalyticsSummary,
} from "@/hospital-admin/lib/mock-data/patient-reviews";

export default function RatingsAndScorecardsPage() {
  const doctorScorecards = useSelector((s: RootState) => s.patientReviews?.doctorScorecards || mockDoctorScorecards);
  const departmentScorecards = useSelector((s: RootState) => s.patientReviews?.departmentScorecards || mockDepartmentScorecards);
  const analytics = useSelector((s: RootState) => s.patientReviews?.analytics || mockReviewAnalyticsSummary);

  const [activeTab, setActiveTab] = useState<"doctors" | "departments">("doctors");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Scorecards & Quality
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Doctor & Department Rating Scorecards
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Evaluates clinical empathy, bedside manner, chamber wait times, and nursing responsiveness — cross-referenced with Analytics Executive (F21).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ReviewsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Hospital Composite Rating Banner */}
        <Card className="border-border/80 shadow-sm bg-gradient-to-r from-amber-500/10 via-card to-card">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-2xl shadow-inner">
                {analytics.hospitalAverageRating}★
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Hospital Composite Satisfaction Index
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    Based on {analytics.totalReviewsCount} Verified Patient Reviews
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Surfaced on Hospital Profile (F24) verified public branding page.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 md:border-l border-border/80 pt-3 md:pt-0 md:pl-6 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Net Promoter Score</span>
                <span className="text-lg font-bold text-emerald-600">+{analytics.npsScore} NPS</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Patient Recommendation</span>
                <span className="text-lg font-bold text-foreground">96.4%</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Response Rate</span>
                <span className="text-lg font-bold text-primary">{analytics.responseRatePercent}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveTab("doctors")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "doctors"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              Doctor Scorecards ({doctorScorecards.length})
            </button>
            <button
              onClick={() => setActiveTab("departments")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "departments"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Department Scorecards ({departmentScorecards.length})
            </button>
          </div>

          <Badge variant="outline" className="text-xs text-muted-foreground">
            Cross-Referenced with F21 Analytics
          </Badge>
        </div>

        {/* Doctor Scorecards Grid */}
        {activeTab === "doctors" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {doctorScorecards.map((doc) => (
              <Card key={doc.doctorId} className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {doc.doctorName.split(" ")[1]?.charAt(0) || "D"}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1">
                          {doc.doctorName}
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        </CardTitle>
                        <p className="text-[11px] text-muted-foreground">
                          {doc.specialty} • {doc.departmentName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{doc.averageRating}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {doc.totalReviews} Reviews
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Dimension Ratings */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Patient Dimension Scores (out of 5.0)
                    </span>
                    {doc.dimensions.map((dim) => (
                      <div key={dim.dimension} className="space-y-0.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground">{dim.dimension}</span>
                          <span className="font-mono font-semibold text-foreground">{dim.score}★</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            style={{ width: `${(dim.score / 5) * 100}%` }}
                            className="h-full bg-amber-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Operational stats bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    <div>
                      <span>Recommendation: </span>
                      <span className="font-semibold text-emerald-600">
                        {doc.patientRecommendationPercent}%
                      </span>
                    </div>
                    <div>
                      <span>F21 Volume: </span>
                      <span className="font-semibold text-foreground font-mono">
                        {doc.operationalVolume} Encounters
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Department Scorecards Grid */}
        {activeTab === "departments" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {departmentScorecards.map((dept) => (
              <Card key={dept.departmentId} className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {dept.departmentName}
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          ID: {dept.departmentId}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{dept.averageRating}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {dept.totalReviews} Reviews
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Dimension Ratings */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Service Quality Dimensions
                    </span>
                    {dept.dimensions.map((dim) => (
                      <div key={dim.dimension} className="space-y-0.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground">{dim.dimension}</span>
                          <span className="font-mono font-semibold text-foreground">{dim.score}★</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            style={{ width: `${(dim.score / 5) * 100}%` }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    <div>
                      <span>Patient Recommendation: </span>
                      <span className="font-semibold text-emerald-600">
                        {dept.patientRecommendationPercent}%
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Operational Quality
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
