"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Layers,
  Sparkles,
  Award,
  Cpu,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { ContentResourcesNav } from "@/hospital-admin/components/content-resources/content-resources-nav";
import { AuthorDepartmentContentModal } from "@/hospital-admin/components/content-resources/AuthorDepartmentContentModal";
import { ClinicalSignOffModal } from "@/hospital-admin/components/content-resources/ClinicalSignOffModal";
import {
  addDepartmentContent,
  approveClinicalReview,
  rejectClinicalReview,
  publishToPublicPortal,
} from "@/hospital-admin/store/slices/contentResourcesSlice";
import { DepartmentContentItem, ClinicalReviewRecord } from "@/hospital-admin/lib/types";

export default function DepartmentContentPage() {
  const dispatch = useDispatch<AppDispatch>();
  const departmentContent = useSelector((s: RootState) => s.contentResources.departmentContent);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);

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

  const filteredContent = departmentContent.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "all" || item.contentType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  const handleOpenReview = (item: DepartmentContentItem) => {
    setReviewModalState({
      isOpen: true,
      contentId: item.id,
      contentTitle: item.title,
    });
  };

  const handleApproveReview = (review: ClinicalReviewRecord) => {
    dispatch(
      approveClinicalReview({
        id: review.contentId,
        category: "Department Content",
        review,
      })
    );
  };

  const handleRejectReview = (review: ClinicalReviewRecord) => {
    dispatch(
      rejectClinicalReview({
        id: review.contentId,
        category: "Department Content",
        review,
      })
    );
  };

  const handlePublish = (itemId: string) => {
    dispatch(publishToPublicPortal({ id: itemId, category: "Department Content" }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Clinical Excellence
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Department Clinical Pathways & Milestones
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Standardized care pathways, procedural milestones, and equipment guides linked to hospital clinical departments.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAuthorModalOpen(true)}
            className="h-8 gap-1 text-xs bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Author Department Content
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
              placeholder="Search by title or department..."
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
              All ({departmentContent.length})
            </Button>
            <Button
              size="sm"
              variant={typeFilter === "care pathway" ? "default" : "outline"}
              onClick={() => setTypeFilter("care pathway")}
              className="h-8 text-xs"
            >
              Care Pathways
            </Button>
            <Button
              size="sm"
              variant={typeFilter === "clinical milestone" ? "default" : "outline"}
              onClick={() => setTypeFilter("clinical milestone")}
              className="h-8 text-xs"
            >
              Milestones
            </Button>
            <Button
              size="sm"
              variant={typeFilter === "technology guide" ? "default" : "outline"}
              onClick={() => setTypeFilter("technology guide")}
              className="h-8 text-xs"
            >
              Tech Guides
            </Button>
          </div>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredContent.map((item) => (
            <Card key={item.id} className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {item.contentType}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {item.syncedWithDepartmentCuration && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] gap-1">
                        <Building2 className="h-3 w-3" />
                        Curation Synced
                      </Badge>
                    )}
                    {item.status === "Published" && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px]">
                        Published
                      </Badge>
                    )}
                    {item.status === "In Review" && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px]">
                        In Review
                      </Badge>
                    )}
                    {item.status === "Approved" && (
                      <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px]">
                        Approved
                      </Badge>
                    )}
                  </div>
                </div>

                <CardTitle className="text-sm font-semibold mt-2 leading-snug">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {item.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Department Attribution */}
                <div className="rounded-lg border border-border bg-muted/30 p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{item.departmentName}</span>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Dept ID: {item.departmentId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content snippet */}
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-sans">
                  {item.content}
                </p>

                {/* Clinical Review Stamp */}
                {item.clinicalReview && (
                  <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-1.5 text-[10px] flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-medium">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified by {item.clinicalReview.reviewerDoctorName}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{item.clinicalReview.reviewedAt}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 border-t border-border/60 pt-2.5">
                  {item.status === "In Review" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReview(item)}
                      className="h-7 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                    >
                      <ShieldCheck className="h-3 w-3" />
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
                      <Globe className="h-3 w-3" />
                      Publish & Sync to Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Author Department Content Modal */}
      <AuthorDepartmentContentModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        onDepartmentContentCreated={(item) => dispatch(addDepartmentContent(item))}
      />

      {/* Clinical Review Sign-off Modal */}
      <ClinicalSignOffModal
        isOpen={reviewModalState.isOpen}
        onClose={() => setReviewModalState((prev) => ({ ...prev, isOpen: false }))}
        contentId={reviewModalState.contentId}
        contentTitle={reviewModalState.contentTitle}
        contentType="Department Content"
        onApprove={handleApproveReview}
        onReject={handleRejectReview}
      />
    </div>
  );
}
