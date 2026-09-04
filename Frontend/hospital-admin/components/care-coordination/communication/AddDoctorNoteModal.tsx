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
import { FileText, Stethoscope, Lock, Users } from "lucide-react";
import { ClinicalNote } from "@/hospital-admin/lib/types";

interface AddDoctorNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: (note: ClinicalNote) => void;
}

const PRESET_PATIENTS = [
  { id: "pat-101", uhid: "UHID-2026-8801", name: "Aarav Sharma", dept: "Cardiology" },
  { id: "pat-102", uhid: "UHID-2026-8802", name: "Sunita Reddy", dept: "Orthopaedics" },
  { id: "pat-103", uhid: "UHID-2026-8803", name: "Vikram Patel", dept: "Neurology" },
  { id: "pat-104", uhid: "UHID-2026-8804", name: "Meenakshi Iyer", dept: "General Medicine" },
];

export function AddDoctorNoteModal({
  isOpen,
  onClose,
  onNoteCreated,
}: AddDoctorNoteModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState("pat-101");
  const [authorDoctorName, setAuthorDoctorName] = useState("Dr. Arvind Kumar");
  const [doctorSpecialty, setDoctorSpecialty] = useState("Cardiology");
  const [priority, setPriority] = useState<"Routine" | "Urgent">("Routine");
  const [visibility, setVisibility] = useState<"Care Team" | "Specific Recipients">("Care Team");
  const [recipientRoles, setRecipientRoles] = useState("Duty Medical Officer, Ward Incharge");
  const [noteText, setNoteText] = useState("");

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = PRESET_PATIENTS.find((p) => p.id === patId);
    if (pat) {
      setDoctorSpecialty(pat.dept);
    }
  };

  const handleSubmit = () => {
    if (!noteText.trim()) return;

    const pat = PRESET_PATIENTS.find((p) => p.id === selectedPatientId) || PRESET_PATIENTS[0];

    const newNote: ClinicalNote = {
      id: `cnote-${Date.now()}`,
      noteId: `NOTE-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientId: pat.id,
      patientName: pat.name,
      patientUhid: pat.uhid,
      authorDoctorId: "doc-101",
      authorDoctorName,
      doctorSpecialty,
      noteText,
      visibility,
      recipientRoles:
        visibility === "Specific Recipients"
          ? recipientRoles.split(",").map((r) => r.trim())
          : undefined,
      priority,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      readBy: [
        {
          staffId: "stf-me",
          staffName: authorDoctorName,
          staffRole: "Attending Consultant",
          readAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        },
      ],
    };

    onNoteCreated(newNote);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Log Clinical Care Team Note</DialogTitle>
              <DialogDescription className="text-xs">
                Record immutable multidisciplinary handoff instructions, post-procedure guidance, or clinical observations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Select Patient</Label>
              <Select value={selectedPatientId} onValueChange={handlePatientSelect}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_PATIENTS.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} ({p.uhid}) - {p.dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Authoring Doctor & Specialty</Label>
              <div className="flex gap-2">
                <Input
                  value={authorDoctorName}
                  onChange={(e) => setAuthorDoctorName(e.target.value)}
                  className="h-9 text-xs flex-1"
                />
                <Input
                  value={doctorSpecialty}
                  onChange={(e) => setDoctorSpecialty(e.target.value)}
                  className="h-9 text-xs w-32"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Priority Level</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as "Routine" | "Urgent")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine" className="text-xs">Routine Handoff</SelectItem>
                  <SelectItem value="Urgent" className="text-xs text-rose-600 font-medium">Urgent / Immediate Action</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Visibility Scope</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as "Care Team" | "Specific Recipients")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Care Team" className="text-xs">Whole Care Team (Doctors & Nurses)</SelectItem>
                  <SelectItem value="Specific Recipients" className="text-xs">Specific Clinical Roles Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {visibility === "Specific Recipients" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Target Roles (comma separated)</Label>
              <Input
                value={recipientRoles}
                onChange={(e) => setRecipientRoles(e.target.value)}
                placeholder="Duty Medical Officer, ICU Incharge"
                className="h-9 text-xs"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Clinical Note & Instructions</Label>
              <span className="text-[10px] text-muted-foreground">Immutable append-only record</span>
            </div>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter comprehensive findings, diagnostic impressions, nursing alerts, or medication titration guidance..."
              rows={5}
              className="text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!noteText.trim()}
            className="text-xs"
          >
            Append to Patient Chart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
