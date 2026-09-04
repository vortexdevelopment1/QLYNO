"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  BookOpen,
  FileText,
  Video,
  GraduationCap,
  Stethoscope,
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Globe,
  Send,
  Eye,
  Sparkles,
  ExternalLink,
  Layers,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { ContentResourcesNav } from "@/hospital-admin/components/content-resources/content-resources-nav";
import { CreateArticleModal } from "@/hospital-admin/components/content-resources/CreateArticleModal";
import { UploadVideoModal } from "@/hospital-admin/components/content-resources/UploadVideoModal";
import { CreatePatientEducationModal } from "@/hospital-admin/components/content-resources/CreatePatientEducationModal";
import { AuthorDoctorContentModal } from "@/hospital-admin/components/content-resources/AuthorDoctorContentModal";
import { AuthorDepartmentContentModal } from "@/hospital-admin/components/content-resources/AuthorDepartmentContentModal";
import { ClinicalSignOffModal } from "@/hospital-admin/components/content-resources/ClinicalSignOffModal";
import { DispatchGuidePreviewModal } from "@/hospital-admin/components/content-resources/DispatchGuidePreviewModal";
import {
  addArticle,
  addVideo,
  addPatientEducation,
  addDoctorContent,
  addDepartmentContent,
  approveClinicalReview,
  rejectClinicalReview,
  publishToPublicPortal,
  incrementDispatchCount,
} from "@/hospital-admin/store/slices/contentResourcesSlice";
import {
  ArticleItem,
  VideoAssetItem,
  PatientEducationItem,
  DoctorContentItem,
  DepartmentContentItem,
  ClinicalReviewRecord,
  ContentCategory,
} from "@/hospital-admin/lib/types";

export default function ContentResourcesOverviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.contentResources);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modals state
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isDoctorContentModalOpen, setIsDoctorContentModalOpen] = useState(false);
  const [isDeptContentModalOpen, setIsDeptContentModalOpen] = useState(false);

  // Review Modal State
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    contentId: string;
    contentTitle: string;
    contentType: ContentCategory;
  }>({
    isOpen: false,
    contentId: "",
    contentTitle: "",
    contentType: "Articles",
  });

  // Dispatch Preview Modal State
  const [dispatchModalState, setDispatchModalState] = useState<{
    isOpen: boolean;
    guide: PatientEducationItem | null;
  }>({
    isOpen: false,
    guide: null,
  });

  // Aggregated stats
  const totalItems =
    state.articles.length +
    state.videos.length +
    state.patientEducation.length +
    state.doctorContent.length +
    state.departmentContent.length;

  const inReviewCount =
    state.articles.filter((a) => a.status === "In Review").length +
    state.videos.filter((v) => v.status === "In Review").length +
    state.patientEducation.filter((e) => e.status === "In Review").length +
    state.doctorContent.filter((d) => d.status === "In Review").length +
    state.departmentContent.filter((d) => d.status === "In Review").length;

  const publishedCount =
    state.articles.filter((a) => a.status === "Published").length +
    state.videos.filter((v) => v.status === "Published").length +
    state.patientEducation.filter((e) => e.status === "Published").length +
    state.doctorContent.filter((d) => d.status === "Published").length +
    state.departmentContent.filter((d) => d.status === "Published").length;

  const totalDispatches = state.patientEducation.reduce(
    (acc, curr) => acc + (curr.dispatchCount || 0),
    0
  );

  // Combined unified items list for recent activity
  const allContentItems = [
    ...state.articles.map((a) => ({
      id: a.id,
      title: a.title,
      type: "Articles" as ContentCategory,
      author: a.authorName,
      status: a.status,
      updatedAt: a.updatedAt,
      raw: a,
    })),
    ...state.videos.map((v) => ({
      id: v.id,
      title: v.title,
      type: "Videos" as ContentCategory,
      author: v.doctorName || v.departmentName || "Hospital Media",
      status: v.status,
      updatedAt: v.createdAt,
      raw: v,
    })),
    ...state.patientEducation.map((e) => ({
      id: e.id,
      title: `${e.code}: ${e.title}`,
      type: "Patient Education" as ContentCategory,
      author: e.departmentName,
      status: e.status,
      updatedAt: e.updatedAt,
      raw: e,
    })),
    ...state.doctorContent.map((d) => ({
      id: d.id,
      title: d.title,
      type: "Doctor Content" as ContentCategory,
      author: d.doctorName,
      status: d.status,
      updatedAt: d.createdAt,
      raw: d,
    })),
    ...state.departmentContent.map((c) => ({
      id: c.id,
      title: c.title,
      type: "Department Content" as ContentCategory,
      author: c.departmentName,
      status: c.status,
      updatedAt: c.createdAt,
      raw: c,
    })),
  ];

  const filteredItems = allContentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenReview = (id: string, title: string, type: ContentCategory) => {
    setReviewModalState({
      isOpen: true,
      contentId: id,
      contentTitle: title,
      contentType: type,
    });
  };

  const handleApproveReview = (review: ClinicalReviewRecord) => {
    dispatch(
      approveClinicalReview({
        id: review.contentId,
        category: review.contentType,
        review,
      })
    );
  };

  const handleRejectReview = (review: ClinicalReviewRecord) => {
    dispatch(
      rejectClinicalReview({
        id: review.contentId,
        category: review.contentType,
        review,
      })
    );
  };

  const handlePublish = (id: string, category: ContentCategory) => {
    dispatch(publishToPublicPortal({ id, category }));
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
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Module F25
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Content & Educational Resources Workstation
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Central authoring, clinical review, and asset management library feeding Hospital Profile (F24) & Communication Hub (F23).
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsArticleModalOpen(true)}
              className="h-8 gap-1 text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              Draft Article
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEducationModalOpen(true)}
              className="h-8 gap-1 text-xs"
            >
              <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
              New Guide / Leaflet
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsVideoModalOpen(true)}
              className="h-8 gap-1 text-xs"
            >
              <Video className="h-3.5 w-3.5 text-blue-600" />
              Upload Video
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ContentResourcesNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Content Library
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalItems}</div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Across 5 content formats
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                In Clinical Review
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {inReviewCount}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Pending NABH doctor sign-off
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Public Portal Live
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Globe className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {publishedCount}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Gated via F24 Hospital Profile
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Patient Dispatches
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Send className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalDispatches}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Dispatched via F23 Communication Hub
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 4-Stage Content Lifecycle Workflow Pipeline */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Content Governance & Cross-Module Pipeline Architecture
            </CardTitle>
            <CardDescription className="text-xs">
              Every piece of educational content follows a strict four-stage pipeline ensuring clinical validity before reaching patients or the public.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stage 1</span>
                  <Badge variant="outline" className="text-[10px]">Authoring</Badge>
                </div>
                <h4 className="mt-2 font-semibold text-foreground text-xs">Draft & Assemble</h4>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Clinicians and medical writers draft articles, video assets, leaflets, or care pathways with citations.
                </p>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Stage 2</span>
                  <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/30 text-[10px]">Mandatory Gate</Badge>
                </div>
                <h4 className="mt-2 font-semibold text-amber-900 dark:text-amber-100 text-xs">NABH Clinical Review</h4>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Consultant doctors verify medical accuracy, dosage guidelines, disclaimers, and zero commercial bias.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Stage 3</span>
                  <Badge className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/30 text-[10px]">Approved</Badge>
                </div>
                <h4 className="mt-2 font-semibold text-emerald-900 dark:text-emerald-100 text-xs">Dual Destination Route</h4>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Approved content is routed to either public website curation or targeted patient dispatch channels.
                </p>
              </div>

              <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Stage 4</span>
                  <Badge className="bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-500/30 text-[10px]">Delivery Gateways</Badge>
                </div>
                <h4 className="mt-2 font-semibold text-blue-900 dark:text-blue-100 text-xs">F24 & F23 Gateways</h4>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Public rendering gated by Hospital Profile (F24) & Verification (Mod 13); patient messages dispatched via Comm Hub (F23).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unified Content Catalog Table */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Hospital Content Ledger</CardTitle>
                <CardDescription className="text-xs">
                  All active articles, video assets, patient education leaflets, doctor tips, and department milestones.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-52">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search content or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={categoryFilter === "all" ? "default" : "outline"}
                    onClick={() => setCategoryFilter("all")}
                    className="h-8 text-xs"
                  >
                    All ({allContentItems.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={categoryFilter === "Articles" ? "default" : "outline"}
                    onClick={() => setCategoryFilter("Articles")}
                    className="h-8 text-xs"
                  >
                    Articles ({state.articles.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={categoryFilter === "Patient Education" ? "default" : "outline"}
                    onClick={() => setCategoryFilter("Patient Education")}
                    className="h-8 text-xs"
                  >
                    Guides ({state.patientEducation.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={categoryFilter === "Videos" ? "default" : "outline"}
                    onClick={() => setCategoryFilter("Videos")}
                    className="h-8 text-xs"
                  >
                    Videos ({state.videos.length})
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 text-[11px] uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Title / Headline</th>
                    <th className="px-4 py-2.5">Format</th>
                    <th className="px-4 py-2.5">Attributed Author / Department</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Clinical Sign-Off</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground max-w-sm">
                        <div className="truncate font-semibold">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          ID: {item.id} • Updated {item.updatedAt}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">
                          {item.type}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {item.author}
                      </td>

                      <td className="px-4 py-3">
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
                        {item.status === "Draft" && (
                          <Badge variant="secondary" className="text-[10px]">
                            Draft
                          </Badge>
                        )}
                        {item.status === "Rejected" && (
                          <Badge variant="destructive" className="text-[10px]">
                            Rejected
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {item.raw.clinicalReview ? (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Signed by {item.raw.clinicalReview.reviewerDoctorName.split(" ")[1]}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            {item.status === "Draft" ? "Pending Submission" : "Under Evaluation"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === "In Review" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReview(item.id, item.title, item.type)}
                              className="h-7 text-[11px] gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Review
                            </Button>
                          )}

                          {item.status === "Approved" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePublish(item.id, item.type)}
                              className="h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Globe className="h-3 w-3" />
                              Publish
                            </Button>
                          )}

                          {item.type === "Patient Education" && item.status === "Published" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDispatch(item.raw as PatientEducationItem)}
                              className="h-7 text-[11px] gap-1 text-primary hover:bg-primary/10"
                            >
                              <Send className="h-3 w-3" />
                              Test Send
                            </Button>
                          )}

                          <Link
                            href={
                              item.type === "Articles"
                                ? "/content-resources/articles"
                                : item.type === "Videos"
                                ? "/content-resources/videos"
                                : item.type === "Patient Education"
                                ? "/content-resources/patient-education"
                                : item.type === "Doctor Content"
                                ? "/content-resources/doctor-content"
                                : "/content-resources/department-content"
                            }
                          >
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onArticleCreated={(art) => dispatch(addArticle(art))}
      />

      <UploadVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onVideoUploaded={(vid) => dispatch(addVideo(vid))}
      />

      <CreatePatientEducationModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        onGuideCreated={(guide) => dispatch(addPatientEducation(guide))}
      />

      <AuthorDoctorContentModal
        isOpen={isDoctorContentModalOpen}
        onClose={() => setIsDoctorContentModalOpen(false)}
        onDoctorContentCreated={(item) => dispatch(addDoctorContent(item))}
      />

      <AuthorDepartmentContentModal
        isOpen={isDeptContentModalOpen}
        onClose={() => setIsDeptContentModalOpen(false)}
        onDepartmentContentCreated={(item) => dispatch(addDepartmentContent(item))}
      />

      <ClinicalSignOffModal
        isOpen={reviewModalState.isOpen}
        onClose={() => setReviewModalState((prev) => ({ ...prev, isOpen: false }))}
        contentId={reviewModalState.contentId}
        contentTitle={reviewModalState.contentTitle}
        contentType={reviewModalState.contentType}
        onApprove={handleApproveReview}
        onReject={handleRejectReview}
      />

      <DispatchGuidePreviewModal
        isOpen={dispatchModalState.isOpen}
        onClose={() => setDispatchModalState({ isOpen: false, guide: null })}
        guide={dispatchModalState.guide}
        onDispatched={handleDispatched}
      />
    </div>
  );
}
