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
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Send, Smartphone, Radio, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { PatientEducationItem } from "@/hospital-admin/lib/types";

interface DispatchGuidePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: PatientEducationItem | null;
  onDispatched: (guideId: string) => void;
}

const PRESET_PATIENTS = [
  { id: "pat-101", name: "Aarav Sharma", uhid: "UHID-2026-8801", phone: "+91 98450 12345", dept: "Cardiology" },
  { id: "pat-102", name: "Sunita Reddy", uhid: "UHID-2026-8802", phone: "+91 98450 67890", dept: "Orthopaedics" },
  { id: "pat-103", name: "Vikram Patel", uhid: "UHID-2026-8803", phone: "+91 98450 54321", dept: "Neurosurgery" },
];

export function DispatchGuidePreviewModal({
  isOpen,
  onClose,
  guide,
  onDispatched,
}: DispatchGuidePreviewModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState("pat-101");
  const [channel, setChannel] = useState<"WhatsApp" | "SMS" | "Portal">("WhatsApp");
  const [language, setLanguage] = useState(guide?.languages[0] || "English");
  const [isDispatched, setIsDispatched] = useState(false);

  if (!guide) return null;

  const patient = PRESET_PATIENTS.find((p) => p.id === selectedPatientId) || PRESET_PATIENTS[0];

  const handleSend = () => {
    setIsDispatched(true);
    setTimeout(() => {
      onDispatched(guide.id);
      setIsDispatched(false);
      onClose();
    }, 900);
  };

  const previewMessage = `Dear ${patient.name} (${patient.uhid}), here is your clinical education guide: "${guide.title}". Please review the preparation instructions carefully before your visit. You can download the full PDF leaflet here: https://qlyno.com${guide.downloadUrl}?lang=${language.toLowerCase()}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Dispatch Patient Education Guide
              </DialogTitle>
              <DialogDescription className="text-xs">
                Routes dispatch through Module F23 (Communication Hub) via verified hospital delivery channels.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Guide Summary Card */}
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">
                {guide.type}
              </Badge>
              <span className="font-mono text-[10px] text-muted-foreground">
                {guide.code}
              </span>
            </div>
            <h4 className="mt-1 font-semibold text-foreground">{guide.title}</h4>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Dept: {guide.departmentName}</span>
              <span>•</span>
              <span>Available in: {guide.languages.join(", ")}</span>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select Recipient Patient</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_PATIENTS.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name} ({p.uhid}) — {p.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Channel */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Delivery Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as any)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp" className="text-xs">WhatsApp Business API</SelectItem>
                  <SelectItem value="SMS" className="text-xs">SMS Notification</SelectItem>
                  <SelectItem value="Portal" className="text-xs">Patient Portal App</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Leaflet Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {guide.languages.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-xs">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hydrated Message Preview */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Dispatched Message Preview (F23 Gateway)</Label>
            <div className="rounded-lg border border-border/80 bg-card p-3 font-sans leading-relaxed text-muted-foreground">
              {previewMessage}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>NABH Clinical Review Verified by {guide.clinicalReview?.reviewerDoctorName || "Consultant"}</span>
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
            disabled={isDispatched}
            onClick={handleSend}
            className="gap-1 text-xs bg-primary text-primary-foreground"
          >
            {isDispatched ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 animate-spin" />
                Dispatching via F23 Hub...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Dispatch via {channel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
