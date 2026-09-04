"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Globe,
  Archive,
  ShieldCheck,
  Eye,
  Sparkles,
  ExternalLink,
  BookOpen,
  Tag,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/hospital-admin/components/ui/dialog";
import { ContentResourcesNav } from "@/hospital-admin/components/content-resources/content-resources-nav";
import { CreateArticleModal } from "@/hospital-admin/components/content-resources/CreateArticleModal";
import { ClinicalSignOffModal } from "@/hospital-admin/components/content-resources/ClinicalSignOffModal";
import {
  addArticle,
  archiveArticle,
  approveClinicalReview,
  rejectClinicalReview,
  publishToPublicPortal,
} from "@/hospital-admin/store/slices/contentResourcesSlice";
import { ArticleItem, ClinicalReviewRecord } from "@/hospital-admin/lib/types";

export default function ArticlesCMSPage() {
  const dispatch = useDispatch<AppDispatch>();
  const articles = useSelector((s: RootState) => s.contentResources.articles);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<ArticleItem | null>(null);

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

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || art.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" || art.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenReview = (art: ArticleItem) => {
    setReviewModalState({
      isOpen: true,
      contentId: art.id,
      contentTitle: art.title,
    });
  };

  const handleApproveReview = (review: ClinicalReviewRecord) => {
    dispatch(
      approveClinicalReview({
        id: review.contentId,
        category: "Articles",
        review,
      })
    );
  };

  const handleRejectReview = (review: ClinicalReviewRecord) => {
    dispatch(
      rejectClinicalReview({
        id: review.contentId,
        category: "Articles",
        review,
      })
    );
  };

  const handlePublish = (artId: string) => {
    dispatch(publishToPublicPortal({ id: artId, category: "Articles" }));
  };

  const handleArchive = (artId: string) => {
    dispatch(archiveArticle(artId));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Health & Wellness CMS
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Blog & Clinical Articles Management
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Draft, clinically verify, and publish evidence-based health articles. Public publishing is gated through Hospital Profile (F24).
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-8 gap-1 text-xs bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Draft New Article
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ContentResourcesNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search articles by title, tag, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className="h-8 text-xs"
              >
                All Status
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "in review" ? "default" : "outline"}
                onClick={() => setStatusFilter("in review")}
                className="h-8 text-xs"
              >
                In Review
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "approved" ? "default" : "outline"}
                onClick={() => setStatusFilter("approved")}
                className="h-8 text-xs"
              >
                Approved
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "published" ? "default" : "outline"}
                onClick={() => setStatusFilter("published")}
                className="h-8 text-xs"
              >
                Published
              </Button>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredArticles.map((art) => (
            <Card key={art.id} className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {art.category}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      v{art.version}.0
                    </Badge>
                    {art.status === "Published" && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px]">
                        Published Live
                      </Badge>
                    )}
                    {art.status === "In Review" && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px]">
                        In Clinical Review
                      </Badge>
                    )}
                    {art.status === "Approved" && (
                      <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px]">
                        Approved
                      </Badge>
                    )}
                    {art.status === "Draft" && (
                      <Badge variant="secondary" className="text-[10px]">
                        Draft
                      </Badge>
                    )}
                    {art.status === "Archived" && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Archived
                      </Badge>
                    )}
                  </div>
                </div>

                <CardTitle className="text-sm font-semibold mt-2 leading-snug">
                  {art.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {art.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 space-y-3">
                {/* Author info & Read time */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">{art.authorName}</span>
                    <span>•</span>
                    <span>{art.authorRole.split("&")[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{art.readTimeMinutes} min read</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {art.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Clinical Review Stamp */}
                {art.clinicalReview && (
                  <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-2 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>NABH Sign-Off: {art.clinicalReview.reviewerDoctorName}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {art.clinicalReview.reviewedAt}
                    </span>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewArticle(art)}
                    className="h-7 text-xs gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {art.status === "In Review" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReview(art)}
                        className="h-7 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Clinical Sign-Off
                      </Button>
                    )}

                    {art.status === "Approved" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handlePublish(art.id)}
                        className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Publish to Public Portal
                      </Button>
                    )}

                    {art.status === "Published" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchive(art.id)}
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Article Modal */}
      <CreateArticleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onArticleCreated={(art) => dispatch(addArticle(art))}
      />

      {/* Clinical Review Sign-off Modal */}
      <ClinicalSignOffModal
        isOpen={reviewModalState.isOpen}
        onClose={() => setReviewModalState((prev) => ({ ...prev, isOpen: false }))}
        contentId={reviewModalState.contentId}
        contentTitle={reviewModalState.contentTitle}
        contentType="Articles"
        onApprove={handleApproveReview}
        onReject={handleRejectReview}
      />

      {/* Article Detail Preview Modal */}
      <Dialog open={!!previewArticle} onOpenChange={() => setPreviewArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">
                {previewArticle?.category}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">
                Slug: /{previewArticle?.slug}
              </span>
            </div>
            <DialogTitle className="text-base font-bold mt-2">
              {previewArticle?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              By {previewArticle?.authorName} ({previewArticle?.authorRole}) • {previewArticle?.readTimeMinutes} min read
            </DialogDescription>
          </DialogHeader>

          {previewArticle && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-lg border border-border bg-muted/30 p-3 italic text-foreground leading-relaxed">
                {previewArticle.summary}
              </div>

              <div className="space-y-2 whitespace-pre-wrap font-sans text-foreground leading-relaxed border-t border-border pt-3">
                {previewArticle.body}
              </div>

              {previewArticle.clinicalReview && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                    <span>NABH Clinical Review Sign-Off Record</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Verified by {previewArticle.clinicalReview.reviewerDoctorName} ({previewArticle.clinicalReview.reviewerSpecialty}) on {previewArticle.clinicalReview.reviewedAt}.
                  </p>
                  <p className="text-[11px] text-foreground font-medium">
                    Notes: {previewArticle.clinicalReview.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
