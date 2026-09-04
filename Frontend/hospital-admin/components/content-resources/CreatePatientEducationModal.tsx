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
import { Badge } from "@/hospital-admin/components/ui/badge";
import { GraduationCap, Plus, Trash2, Globe, Send, ShieldAlert } from "lucide-react";
import {
  PatientEducationItem,
  EducationType,
  ContentDestination,
  ContentSection,
} from "@/hospital-admin/lib/types";

interface CreatePatientEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuideCreated: (guide: PatientEducationItem) => void;
}

const DEPARTMENTS = [
  { id: "dept-cardio", name: "Cardiology" },
  { id: "dept-ortho", name: "Orthopaedics" },
  { id: "dept-neuro", name: "Neurosurgery" },
  { id: "dept-med", name: "General Medicine & Nutrition" },
  { id: "dept-rad", name: "Radiology & Imaging" },
  { id: "dept-obgyn", name: "Obstetrics & Gynaecology" },
  { id: "dept-onco", name: "Medical Oncology" },
];

const AVAILABLE_LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Marathi", "Bengali"];

export function CreatePatientEducationModal({
  isOpen,
  onClose,
  onGuideCreated,
}: CreatePatientEducationModalProps) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState(`GUIDE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  const [type, setType] = useState<EducationType>("Pre-Op Guide");
  const [departmentId, setDepartmentId] = useState("dept-cardio");
  const [procedureName, setProcedureName] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English", "Hindi"]);
  const [summary, setSummary] = useState("");
  const [destination, setDestination] = useState<ContentDestination>("Both");
  const [triggerSource, setTriggerSource] = useState<"F5 Discharge" | "F6 Surgery Scheduled" | "F6 Surgery Completed" | "General">("F6 Surgery Scheduled");

  // Dynamic sections
  const [sections, setSections] = useState<ContentSection[]>([
    {
      heading: "Preparation & Fasting Protocols",
      body: "Follow these mandatory pre-procedural guidelines carefully prior to hospital reporting:",
      items: ["No solid food for 6 hours prior", "Hold oral diabetic medications on the morning of surgery"],
    },
    {
      heading: "Warning Signs & Emergency Escalation",
      body: "Contact your primary hospital care team immediately if you experience severe discomfort or fever.",
      items: ["Oral temperature > 100.4°F", "Sudden localized swelling or persistent pain"],
    },
  ]);

  const selectedDept = DEPARTMENTS.find((d) => d.id === departmentId) || DEPARTMENTS[0];

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        heading: `Section ${sections.length + 1}`,
        body: "",
        items: [],
      },
    ]);
  };

  const handleUpdateSection = (index: number, field: "heading" | "body", value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || sections.length === 0) return;

    const newGuide: PatientEducationItem = {
      id: `edu-${Date.now()}`,
      title,
      code,
      type,
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      procedureName: procedureName.trim() || undefined,
      languages: selectedLanguages,
      summary: summary || title,
      contentSections: sections,
      downloadUrl: `/downloads/guides/${code.toLowerCase()}.pdf`,
      destination,
      triggeredByTrigger: triggerSource,
      status: "In Review",
      version: 1,
      dispatchCount: 0,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    onGuideCreated(newGuide);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Create Patient Education Guide / Leaflet
              </DialogTitle>
              <DialogDescription className="text-xs">
                Author dual-destination clinical education guides for targeted dispatch (F23) or public portal download.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Title & Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Guide / Leaflet Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Pre-Operative Fasting & Medication Checklist"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Document Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="GUIDE-CARD-001"
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Education Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Educational Format</Label>
              <Select value={type} onValueChange={(v) => setType(v as EducationType)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pre-Op Guide" className="text-xs">Pre-Op Preparation Guide</SelectItem>
                  <SelectItem value="Post-Op Guide" className="text-xs">Post-Op Recovery Guide</SelectItem>
                  <SelectItem value="Leaflet" className="text-xs">Patient Education Leaflet</SelectItem>
                  <SelectItem value="Infographic" className="text-xs">Illustrated Infographic</SelectItem>
                  <SelectItem value="Care Pathway" className="text-xs">Clinical Care Pathway</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinical Department</Label>
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
          </div>

          {/* Procedure Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Associated Clinical Procedure (Optional)</Label>
            <Input
              value={procedureName}
              onChange={(e) => setProcedureName(e.target.value)}
              placeholder="e.g., Total Knee Arthroplasty, Coronary Angiogram, Cesarean Section"
              className="text-xs"
            />
          </div>

          {/* Multilingual Support */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Multilingual Translations Available
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <Badge
                    key={lang}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleLanguage(lang)}
                    className="cursor-pointer text-[11px]"
                  >
                    {lang}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Destination & Cross-Module Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Distribution Destination</Label>
              <Select value={destination} onValueChange={(v) => setDestination(v as ContentDestination)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Both" className="text-xs">Both (Public Portal & Targeted Dispatch)</SelectItem>
                  <SelectItem value="Targeted Patient Dispatch" className="text-xs">Targeted Patient Dispatch Only (F23)</SelectItem>
                  <SelectItem value="Public Website" className="text-xs">Public Website Download Only (F24)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trigger Source Event</Label>
              <Select value={triggerSource} onValueChange={(v) => setTriggerSource(v as any)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F6 Surgery Scheduled" className="text-xs">F6: Scheduled Surgery (Pre-Op Guide)</SelectItem>
                  <SelectItem value="F5 Discharge" className="text-xs">F5: Inpatient Discharge (Post-Op Guide)</SelectItem>
                  <SelectItem value="F6 Surgery Completed" className="text-xs">F6: OT Recovery Sign-Off</SelectItem>
                  <SelectItem value="General" className="text-xs">General / On-Demand Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section Builder */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Clinical Content Sections
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSection} className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Add Section
              </Button>
            </div>

            {sections.map((section, idx) => (
              <div key={idx} className="rounded-lg border border-border/80 bg-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-primary">Section #{idx + 1}</span>
                  {sections.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSection(idx)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <Input
                  value={section.heading}
                  onChange={(e) => handleUpdateSection(idx, "heading", e.target.value)}
                  placeholder="Section heading (e.g. Fasting Protocols, Wound Care)"
                  className="text-xs font-medium"
                />
                <Textarea
                  value={section.body}
                  onChange={(e) => handleUpdateSection(idx, "body", e.target.value)}
                  placeholder="Detailed instructions for the patient..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
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
            disabled={!title.trim()}
            onClick={handleSubmit}
            className="text-xs"
          >
            Submit for Clinical Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
