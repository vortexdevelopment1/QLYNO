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
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Stethoscope, ShieldCheck, Plus, X } from "lucide-react";
import { DoctorContentItem } from "@/hospital-admin/lib/types";

interface AuthorDoctorContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoctorContentCreated: (item: DoctorContentItem) => void;
}

const DOCTORS = [
  { id: "doc-101", name: "Dr. Arvind Kumar", specialty: "Cardiology", uhid: "DOC-2026-CARD-01", verified: true },
  { id: "doc-102", name: "Dr. Sunita Rao", specialty: "Cardiovascular Surgery", uhid: "DOC-2026-CTVS-02", verified: true },
  { id: "doc-103", name: "Dr. Rajeshwar Singh", specialty: "Orthopaedics", uhid: "DOC-2026-ORTH-03", verified: true },
  { id: "doc-105", name: "Dr. Meenakshi Sundaram", specialty: "Neurosurgery", uhid: "DOC-2026-NEUR-05", verified: true },
  { id: "doc-106", name: "Dr. Priya Deshmukh", specialty: "Endocrinology", uhid: "DOC-2026-ENDO-06", verified: true },
];

export function AuthorDoctorContentModal({
  isOpen,
  onClose,
  onDoctorContentCreated,
}: AuthorDoctorContentModalProps) {
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [contentType, setContentType] = useState<"Health Tip" | "Case Study" | "Specialty Guide" | "Research Paper" | "Video Article">("Health Tip");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Clinical Pearl", "Specialist Insights"]);
  const [syncWithBio, setSyncWithBio] = useState(true);

  const selectedDoc = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const newItem: DoctorContentItem = {
      id: `doc-cnt-${Date.now()}`,
      title,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      doctorSpecialty: selectedDoc.specialty,
      doctorUhid: selectedDoc.uhid,
      isDoctorVerified: selectedDoc.verified,
      contentType,
      summary: summary || title,
      content,
      tags,
      status: "In Review",
      syncedWithDoctorBio: syncWithBio,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    onDoctorContentCreated(newItem);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Author Doctor-Attributed Content</DialogTitle>
              <DialogDescription className="text-xs">
                Author clinical pearls, case studies, or specialty guides linked to real verified physician profiles.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Doctor Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Attributed Physician (Doctor Management Source of Truth)</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCTORS.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id} className="text-xs">
                    {doc.name} — {doc.specialty} ({doc.uhid})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Doctor Verification Badge: Verified Specialist</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Content Format */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Content Format</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Health Tip" className="text-xs">Clinical Pearl / Health Tip</SelectItem>
                  <SelectItem value="Case Study" className="text-xs">De-Identified Surgical Case Study</SelectItem>
                  <SelectItem value="Specialty Guide" className="text-xs">Specialist Clinical Protocol</SelectItem>
                  <SelectItem value="Research Paper" className="text-xs">Research Whitepaper / Abstract</SelectItem>
                  <SelectItem value="Video Article" className="text-xs">Video Article</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Content Headline</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Distinguishing Angina from Musculoskeletal Pain"
                className="text-xs"
              />
            </div>
          </div>

          {/* Abstract / Summary */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Executive Abstract</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Key clinical takeaways for fellow clinicians and informed patients..."
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Detailed Content */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Clinical Text & Findings</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed case presentation, clinical pearls, or step-by-step specialist protocol..."
              rows={5}
              className="text-xs font-mono"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Specialty Tags</Label>
            <div className="flex gap-1.5">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag & press enter"
                className="text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag} className="px-2">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Sync with Doctor Profile */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
            <div>
              <span className="font-semibold block text-xs">Sync with Hospital Profile (F24)</span>
              <span className="text-[11px] text-muted-foreground">
                Feeds into the doctor's public bio on the verified hospital preview portal.
              </span>
            </div>
            <Checkbox
              id="chk-bio"
              checked={syncWithBio}
              onCheckedChange={(c) => setSyncWithBio(!!c)}
            />
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
            disabled={!title.trim() || !content.trim()}
            onClick={handleSubmit}
            className="text-xs"
          >
            Submit for Clinical Sign-off
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
