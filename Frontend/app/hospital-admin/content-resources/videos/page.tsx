"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Video,
  Plus,
  Search,
  Play,
  Clock,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Subtitles,
  Film,
  Building2,
  Stethoscope,
  Sparkles,
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
import { UploadVideoModal } from "@/hospital-admin/components/content-resources/UploadVideoModal";
import { ClinicalSignOffModal } from "@/hospital-admin/components/content-resources/ClinicalSignOffModal";
import {
  addVideo,
  approveClinicalReview,
  rejectClinicalReview,
  publishToPublicPortal,
} from "@/hospital-admin/store/slices/contentResourcesSlice";
import { VideoAssetItem, ClinicalReviewRecord } from "@/hospital-admin/lib/types";

export default function VideosAssetPage() {
  const dispatch = useDispatch<AppDispatch>();
  const videos = useSelector((s: RootState) => s.contentResources.videos);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoAssetItem | null>(null);

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

  const filteredVideos = videos.filter((vid) => {
    const matchesSearch =
      vid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vid.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vid.doctorName && vid.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vid.departmentName && vid.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || vid.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOpenReview = (vid: VideoAssetItem) => {
    setReviewModalState({
      isOpen: true,
      contentId: vid.id,
      contentTitle: vid.title,
    });
  };

  const handleApproveReview = (review: ClinicalReviewRecord) => {
    dispatch(
      approveClinicalReview({
        id: review.contentId,
        category: "Videos",
        review,
      })
    );
  };

  const handleRejectReview = (review: ClinicalReviewRecord) => {
    dispatch(
      rejectClinicalReview({
        id: review.contentId,
        category: "Videos",
        review,
      })
    );
  };

  const handlePublish = (vidId: string) => {
    dispatch(publishToPublicPortal({ id: vidId, category: "Videos" }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Media Asset Layer
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Patient Video Library & Explainers
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Extends Hospital Profile (F24) MediaAsset pattern with duration metadata, captions, and procedure explainers.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="h-8 gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Upload Video Asset
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ContentResourcesNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Search & Category Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search videos by title, doctor, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Button
              size="sm"
              variant={categoryFilter === "all" ? "default" : "outline"}
              onClick={() => setCategoryFilter("all")}
              className="h-8 text-xs"
            >
              All ({videos.length})
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === "patient education" ? "default" : "outline"}
              onClick={() => setCategoryFilter("patient education")}
              className="h-8 text-xs"
            >
              Patient Education
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === "procedure explainer" ? "default" : "outline"}
              onClick={() => setCategoryFilter("procedure explainer")}
              className="h-8 text-xs"
            >
              Procedure Explainers
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === "doctor introduction" ? "default" : "outline"}
              onClick={() => setCategoryFilter("doctor introduction")}
              className="h-8 text-xs"
            >
              Doctor Intros
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === "facility tour" ? "default" : "outline"}
              onClick={() => setCategoryFilter("facility tour")}
              className="h-8 text-xs"
            >
              Facility Tours
            </Button>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((vid) => (
            <Card key={vid.id} className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden">
              <div>
                {/* Video Card Thumbnail / Click to Play Frame */}
                <div
                  className="relative aspect-video w-full bg-slate-950 flex items-center justify-center group cursor-pointer overflow-hidden"
                  onClick={() => setPreviewVideo(vid)}
                >
                  {vid.thumbnailUrl && (
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-primary-foreground ml-0.5" />
                  </div>

                  <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5">
                    <Badge className="bg-black/80 text-white border-0 text-[10px] font-mono">
                      {formatDuration(vid.durationSeconds)}
                    </Badge>
                    <Badge className="bg-black/80 text-white border-0 text-[10px]">
                      {vid.quality}
                    </Badge>
                  </div>

                  {vid.hasCaptions && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-black/80 text-white border-0 text-[10px] gap-1">
                        <Subtitles className="h-3 w-3" />
                        CC
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {vid.category}
                    </Badge>
                    {vid.status === "Published" && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px]">
                        Published
                      </Badge>
                    )}
                    {vid.status === "In Review" && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px]">
                        In Review
                      </Badge>
                    )}
                    {vid.status === "Approved" && (
                      <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px]">
                        Approved
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-sm font-semibold mt-2 line-clamp-2 leading-snug">
                    {vid.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {vid.description}
                  </CardDescription>
                </CardHeader>
              </div>

              <CardContent className="p-4 pt-0 space-y-3">
                {/* Meta info */}
                <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border/60 pt-2.5">
                  {vid.doctorName && (
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Stethoscope className="h-3.5 w-3.5 text-primary" />
                      <span>{vid.doctorName}</span>
                    </div>
                  )}
                  {vid.departmentName && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{vid.departmentName}</span>
                    </div>
                  )}
                </div>

                {/* Clinical Review Stamp */}
                {vid.clinicalReview && (
                  <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-1.5 text-[10px] flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-medium">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>NABH Signed</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{vid.clinicalReview.reviewedAt}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewVideo(vid)}
                    className="h-7 text-xs gap-1 text-primary hover:text-primary font-medium"
                  >
                    <Play className="h-3 w-3 fill-primary" />
                    Play Video
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {vid.status === "In Review" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReview(vid)}
                        className="h-7 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        Sign-Off
                      </Button>
                    )}

                    {vid.status === "Approved" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handlePublish(vid.id)}
                        className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Globe className="h-3 w-3" />
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Video Modal */}
      <UploadVideoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onVideoUploaded={(vid) => dispatch(addVideo(vid))}
      />

      {/* Clinical Review Sign-off Modal */}
      <ClinicalSignOffModal
        isOpen={reviewModalState.isOpen}
        onClose={() => setReviewModalState((prev) => ({ ...prev, isOpen: false }))}
        contentId={reviewModalState.contentId}
        contentTitle={reviewModalState.contentTitle}
        contentType="Videos"
        onApprove={handleApproveReview}
        onReject={handleRejectReview}
      />

      {/* Video Player Modal with Functional HTML5 Playback */}
      <Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border">
          {previewVideo && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="px-5 pt-4 pb-3 border-b border-border/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {previewVideo.category}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono">
                      {previewVideo.quality} • {formatDuration(previewVideo.durationSeconds)}
                    </Badge>
                  </div>
                  <DialogTitle className="text-base font-bold mt-1 text-foreground">
                    {previewVideo.title}
                  </DialogTitle>
                </div>
              </div>

              {/* Functional HTML5 Video Element */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                <video
                  key={previewVideo.id}
                  src={previewVideo.videoUrl}
                  poster={previewVideo.thumbnailUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                >
                  <source src={previewVideo.videoUrl} type="video/mp4" />
                  Your browser does not support HTML5 video streaming.
                </video>
              </div>

              {/* Video Information & Meta Bar */}
              <div className="p-4 space-y-3 bg-muted/20">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {previewVideo.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {previewVideo.doctorName && (
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <Stethoscope className="h-3.5 w-3.5 text-primary" />
                        <span>{previewVideo.doctorName}</span>
                      </div>
                    )}
                    {previewVideo.departmentName && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{previewVideo.departmentName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {previewVideo.hasCaptions && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Subtitles className="h-3 w-3" />
                        Captions Enabled
                      </Badge>
                    )}
                    <span className="font-mono text-[10px]">ID: {previewVideo.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
