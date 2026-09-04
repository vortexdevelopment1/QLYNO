"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  GraduationCap,
  Plus,
  Search,
  Globe,
  Send,
  Download,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { ContentResourcesNav } from "@/hospital-admin/components/content-resources/content-resources-nav";
import { CreatePatientEducationModal } from "@/hospital-admin/components/content-resources/CreatePatientEducationModal";
import { ClinicalSignOffModal } from "@/hospital-admin/components/content-resources/ClinicalSignOffModal";
import { DispatchGuidePreviewModal } from "@/hospital-admin/components/content-resources/DispatchGuidePreviewModal";
import {
  addPatientEducation,
  approveClinicalReview,
  rejectClinicalReview,
  publishToPublicPortal,
  incrementDispatchCount,
} from "@/hospital-admin/store/slices/contentResourcesSlice";
import { PatientEducationItem, ClinicalReviewRecord } from "@/hospital-admin/lib/types";

export default function PatientEducationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const educationItems = useSelector((s: RootState) => s.contentResources.patientEducation);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Review Modal State
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    contentId: string;
    contentTitle: string;
  }>({
    isOpen: false,
    contentId: "",
    contentTitle: "",
  });

  // Dispatch Preview Modal State
  const [dispatchModalState, setDispatchModalState] = useState<{
    isOpen: boolean;
    guide: PatientEducationItem | null;
  }>({
    isOpen: false,
    guide: null,
  });

  const filteredItems = educationItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.procedureName && item.procedureName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      typeFilter === "all" || item.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesDest =
      destinationFilter === "all" || item.destination.toLowerCase() === destinationFilter.toLowerCase();

    return matchesSearch && matchesType && matchesDest;
  });

  const toggleExpand = (id: string) => {
    setExpandedGuideId(expandedGuideId === id ? null : id);
  };

  const handleOpenReview = (item: PatientEducationItem) => {
    setReviewModalState({
      isOpen: true,
      contentId: item.id,
      contentTitle: `${item.code}: ${item.title}`,
    });
  };

  const handleApproveReview = (review: ClinicalReviewRecord) => {
    dispatch(
      approveClinicalReview({
        id: review.contentId,
        category: "Patient Education",
        review,
      })
    );
  };

  const handleRejectReview = (review: ClinicalReviewRecord) => {
    dispatch(
      rejectClinicalReview({
        id: review.contentId,
        category: "Patient Education",
        review,
      })
    );
  };

  const handlePublish = (itemId: string) => {
    dispatch(publishToPublicPortal({ id: itemId, category: "Patient Education" }));
  };

  const handleOpenDispatch = (guide: PatientEducationItem) => {
    setDispatchModalState({
      isOpen: true,
      guide,
    });
  };

  const handleDispatched = (guideId: string) => {
    dispatch(incrementDispatchCount({ id: guideId, count: 1 }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                Patient Empowerment
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Pre/Post-Op Guides & Multilingual Leaflets
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Dual-destination educational resources: targeted patient dispatch via F23 Communication Hub (triggered by F5/F6) or public portal download.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-8 gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Guide / Leaflet
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ContentResourcesNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by title, document code, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Button
              size="sm"
              variant={typeFilter === "all" ? "default" : "outline"}
              onClick={() => setTypeFilter("all")}
              className="h-8 text-xs"
            >
              All Types ({educationItems.length})
            </Button>
            <Button
              size="sm"
              variant={typeFilter === "pre-op guide" ? "default" : "outline"}
              onClick={() => setTypeFilter("pre-op guide")}
              className="h-8 text-xs"
            >
              Pre-Op Guides
            </Button>
            <Button
              size="sm"
              variant={typeFilter === "post-op guide" ? "default" : "outline"}
              onClick={() => setTypeFilter("post-op guide")}
              className="h-8 text-xs"
            >
              Post-Op Guides
            </Button>
            <Button
              size="sm"
              variant={typeFilter === "leaflet" ? "default" : "outline"}
              onClick={() => setTypeFilter("leaflet")}
              className="h-8 text-xs"
            >
              Leaflets
            </Button>
          </div>
        </div>

        {/* Guides List */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isExpanded = expandedGuideId === item.id;

            return (
              <Card
                key={item.id}
                className={`border-border/80 shadow-sm bg-card transition-all ${
                  isExpanded ? "ring-1 ring-primary/30" : ""
                }`}
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {item.code}
                        </Badge>
                        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px]">
                          {item.type}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.departmentName}
                        </Badge>
                        {item.status === "Published" && (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px]">
                            Published & Ready
                          </Badge>
                        )}
                        {item.status === "In Review" && (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px]">
                            In Review
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-sm font-semibold mt-2 text-foreground">
                        {item.title}
                      </CardTitle>
                      {item.procedureName && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Associated Procedure: <span className="font-medium text-foreground">{item.procedureName}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {item.destination === "Both" && (
                        <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] gap-1">
                          <Globe className="h-3 w-3" />
                          Public & Dispatch
                        </Badge>
                      )}
                      {item.destination === "Targeted Patient Dispatch" && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] gap-1">
                          <Send className="h-3 w-3" />
                          Targeted Dispatch (F23)
                        </Badge>
                      )}
                      {item.destination === "Public Website" && (
                        <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px] gap-1">
                          <Globe className="h-3 w-3" />
                          Public Download
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Languages & Dispatches bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">Languages:</span>
                      <div className="flex gap-1">
                        {item.languages.map((l) => (
                          <span key={l} className="rounded bg-muted px-1.5 py-0.2 text-[10px]">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.triggeredByTrigger && (
                        <span className="font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded">
                          Trigger: {item.triggeredByTrigger}
                        </span>
                      )}
                      <span className="font-semibold text-primary">
                        {item.dispatchCount || 0} Patient Dispatches
                      </span>
                    </div>
                  </div>

                  {/* Clinical Sign-Off Box */}
                  {item.clinicalReview && (
                    <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-2 text-[11px] flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>NABH Verified by {item.clinicalReview.reviewerDoctorName} ({item.clinicalReview.reviewerSpecialty})</span>
                      </div>
                      <span className="font-mono text-muted-foreground text-[10px]">{item.clinicalReview.reviewedAt}</span>
                    </div>
                  )}

                  {/* Expandable Sections View */}
                  {isExpanded && (
                    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3 pt-2 text-xs">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground block">
                        Included Clinical Checklists & Preparation Protocols
                      </span>

                      {item.contentSections.map((sec, idx) => (
                        <div key={idx} className="rounded border border-border/80 bg-card p-3 space-y-1.5">
                          <h5 className="font-semibold text-foreground text-xs">{sec.heading}</h5>
                          <p className="text-muted-foreground leading-relaxed">{sec.body}</p>
                          {sec.items && sec.items.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 pl-1 text-muted-foreground">
                              {sec.items.map((it, i) => (
                                <li key={i} className="text-foreground">{it}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(item.id)}
                      className="h-7 text-xs gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Hide Content Sections
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          View {item.contentSections.length} Content Sections
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {item.status === "In Review" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReview(item)}
                          className="h-7 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Clinical Sign-Off
                        </Button>
                      )}

                      {item.status === "Approved" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handlePublish(item.id)}
                          className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve for Dispatch
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleOpenDispatch(item)}
                        className="h-7 text-xs gap-1 bg-primary text-primary-foreground"
                      >
                        <Send className="h-3 w-3" />
                        Dispatch via F23
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create Guide Modal */}
      <CreatePatientEducationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGuideCreated={(guide) => dispatch(addPatientEducation(guide))}
      />

      {/* Clinical Review Sign-off Modal */}
      <ClinicalSignOffModal
        isOpen={reviewModalState.isOpen}
        onClose={() => setReviewModalState((prev) => ({ ...prev, isOpen: false }))}
        contentId={reviewModalState.contentId}
        contentTitle={reviewModalState.contentTitle}
        contentType="Patient Education"
        onApprove={handleApproveReview}
        onReject={handleRejectReview}
      />

      {/* Dispatch Preview Modal */}
      <DispatchGuidePreviewModal
        isOpen={dispatchModalState.isOpen}
        onClose={() => setDispatchModalState({ isOpen: false, guide: null })}
        guide={dispatchModalState.guide}
        onDispatched={handleDispatched}
      />
    </div>
  );
}
