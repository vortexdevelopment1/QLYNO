"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Checkbox } from "@/hospital-admin/components/ui/checkbox";
import { Video, UploadCloud, Film } from "lucide-react";
import { VideoAssetItem, VideoCategory } from "@/hospital-admin/lib/types";

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded: (video: VideoAssetItem) => void;
}

const DEPARTMENTS = [
  { id: "dept-cardio", name: "Cardiology" },
  { id: "dept-ortho", name: "Orthopaedics" },
  { id: "dept-neuro", name: "Neurosurgery" },
  { id: "dept-emg", name: "Emergency & Trauma" },
  { id: "dept-anaesthesia", name: "Anesthesiology & OT" },
];

const DOCTORS = [
  { id: "doc-101", name: "Dr. Arvind Kumar", dept: "Cardiology" },
  { id: "doc-102", name: "Dr. Sunita Rao", dept: "Cardiovascular Surgery" },
  { id: "doc-103", name: "Dr. Rajeshwar Singh", dept: "Orthopaedics" },
  { id: "doc-105", name: "Dr. Meenakshi Sundaram", dept: "Neurosurgery" },
];

export function UploadVideoModal({
  isOpen,
  onClose,
  onVideoUploaded,
}: UploadVideoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<VideoCategory>("Patient Education");
  const [videoUrl, setVideoUrl] = useState("https://assets.qlyno.com/videos/patient-guide-hd.mp4");
  const [thumbnailUrl, setThumbnailUrl] = useState("/images/videos/thumb-generic.jpg");
  const [durationMinutes, setDurationMinutes] = useState(4);
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [quality, setQuality] = useState<"1080p" | "4K" | "720p">("1080p");
  const [departmentId, setDepartmentId] = useState("dept-cardio");
  const [doctorId, setDoctorId] = useState("doc-101");
  const [hasCaptions, setHasCaptions] = useState(true);
  const [requiresClinicalReview, setRequiresClinicalReview] = useState(true);

  const selectedDept = DEPARTMENTS.find((d) => d.id === departmentId);
  const selectedDoc = DOCTORS.find((d) => d.id === doctorId);

  const handleSubmit = () => {
    if (!title.trim() || !videoUrl.trim()) return;

    const totalSeconds = durationMinutes * 60 + durationSeconds;

    const newVideo: VideoAssetItem = {
      id: `vid-${Date.now()}`,
      title,
      description,
      category,
      videoUrl,
      thumbnailUrl: thumbnailUrl || "/images/videos/thumb-generic.jpg",
      durationSeconds: totalSeconds,
      quality,
      departmentId: selectedDept?.id,
      departmentName: selectedDept?.name,
      doctorId: category === "Doctor Introduction" || doctorId !== "none" ? selectedDoc?.id : undefined,
      doctorName: category === "Doctor Introduction" || doctorId !== "none" ? selectedDoc?.name : undefined,
      hasCaptions,
      status: requiresClinicalReview ? "In Review" : "Published",
      requiresClinicalReview,
      publishedToPublic: !requiresClinicalReview,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    onVideoUploaded(newVideo);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Upload & Register Video Asset</DialogTitle>
              <DialogDescription className="text-xs">
                Extends Hospital Profile MediaAsset pattern with duration, captions, and clinical sign-off flags.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Video Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Preparing for Knee Replacement Surgery: Day of Procedure"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Video Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as VideoCategory)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Patient Education" className="text-xs">Patient Education</SelectItem>
                  <SelectItem value="Procedure Explainer" className="text-xs">Procedure Explainer</SelectItem>
                  <SelectItem value="Doctor Introduction" className="text-xs">Doctor Introduction</SelectItem>
                  <SelectItem value="Facility Tour" className="text-xs">Facility Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Stream Resolution</Label>
              <Select value={quality} onValueChange={(v) => setQuality(v as "1080p" | "4K" | "720p")}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1080p" className="text-xs">1080p Full HD</SelectItem>
                  <SelectItem value="4K" className="text-xs">4K Ultra HD</SelectItem>
                  <SelectItem value="720p" className="text-xs">720p HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Video Summary / Caption</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of video contents and key learning takeaways..."
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Video URL & Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Video Storage URL</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://assets.qlyno.com/videos/..."
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Poster / Thumbnail URL</Label>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="/images/videos/thumb-..."
                className="text-xs"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Duration (Minutes)</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Duration (Seconds)</Label>
              <Input
                type="number"
                min={0}
                max={59}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Department & Doctor Attribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Attributed Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-xs">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Featured Doctor (Optional)</Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">None / General Hospital</SelectItem>
                  {DOCTORS.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id} className="text-xs">
                      {doc.name} ({doc.dept})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accessibility & Clinical Checkbox */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="chk-captions"
                checked={hasCaptions}
                onCheckedChange={(c) => setHasCaptions(!!c)}
              />
              <label htmlFor="chk-captions" className="text-xs text-foreground cursor-pointer font-medium">
                Include Subtitles / Closed Captions (Multilingual)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="chk-review"
                checked={requiresClinicalReview}
                onCheckedChange={(c) => setRequiresClinicalReview(!!c)}
              />
              <label htmlFor="chk-review" className="text-xs text-foreground cursor-pointer font-medium">
                Contains Medical Advice (Requires NABH Clinical Review prior to public display)
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={!title.trim() || !videoUrl.trim()}
            onClick={handleSubmit}
            className="text-xs"
          >
            Save Video Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
