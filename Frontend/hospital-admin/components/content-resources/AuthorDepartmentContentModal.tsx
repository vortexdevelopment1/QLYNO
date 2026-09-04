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
import { Building2 } from "lucide-react";
import { DepartmentContentItem } from "@/hospital-admin/lib/types";

interface AuthorDepartmentContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentContentCreated: (item: DepartmentContentItem) => void;
}

const DEPARTMENTS = [
  { id: "dept-cardio", name: "Cardiology & Interventional Sciences" },
  { id: "dept-ortho", name: "Orthopaedics & Joint Reconstruction" },
  { id: "dept-neuro", name: "Neurosurgery & Spine Institute" },
  { id: "dept-emg", name: "Emergency & Critical Care Trauma" },
  { id: "dept-onco", name: "Medical & Surgical Oncology" },
  { id: "dept-obgyn", name: "Obstetrics & Comprehensive Women's Health" },
];

export function AuthorDepartmentContentModal({
  isOpen,
  onClose,
  onDepartmentContentCreated,
}: AuthorDepartmentContentModalProps) {
  const [departmentId, setDepartmentId] = useState(DEPARTMENTS[0].id);
  const [contentType, setContentType] = useState<"Care Pathway" | "Clinical Milestone" | "Technology Guide" | "Department Leaflet">("Care Pathway");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [syncWithCuration, setSyncWithCuration] = useState(true);

  const selectedDept = DEPARTMENTS.find((d) => d.id === departmentId) || DEPARTMENTS[0];

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const newItem: DepartmentContentItem = {
      id: `dept-cnt-${Date.now()}`,
      title,
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      contentType,
      summary: summary || title,
      content,
      status: "In Review",
      syncedWithDepartmentCuration: syncWithCuration,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    onDepartmentContentCreated(newItem);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Author Department Content & Pathways</DialogTitle>
              <DialogDescription className="text-xs">
                Author clinical care pathways, department milestones, or equipment guides linked to hospital departments.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Department */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Attributed Clinical Department</Label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Content Format */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Format</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Care Pathway" className="text-xs">Standardized Care Pathway</SelectItem>
                  <SelectItem value="Clinical Milestone" className="text-xs">Clinical Milestone / Achievement</SelectItem>
                  <SelectItem value="Technology Guide" className="text-xs">Advanced Technology Explainer</SelectItem>
                  <SelectItem value="Department Leaflet" className="text-xs">Department Service Brochure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Headline</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Fast-Track Chest Pain Triage Pathway"
                className="text-xs"
              />
            </div>
          </div>

          {/* Abstract / Summary */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Summary</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Concise overview of department capability, SLA benchmarks, or milestone..."
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Detailed Content */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Detailed Pathway / Description</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Clinical steps, equipment specs, or milestone metrics..."
              rows={5}
              className="text-xs font-mono"
            />
          </div>

          {/* Sync with Department Curation */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
            <div>
              <span className="font-semibold block text-xs">Sync with Hospital Profile (F24)</span>
              <span className="text-[11px] text-muted-foreground">
                Surfaces under the department's public capabilities on the hospital profile.
              </span>
            </div>
            <Checkbox
              id="chk-dept-cur"
              checked={syncWithCuration}
              onCheckedChange={(c) => setSyncWithCuration(!!c)}
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
