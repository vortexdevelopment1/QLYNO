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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Send, Smartphone, CheckCircle2, MessageSquare } from "lucide-react";
import { NPSSurveyResponse } from "@/hospital-admin/lib/types/patient-reviews";

interface DispatchSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatch: (survey: NPSSurveyResponse) => void;
}

export function DispatchSurveyModal({
  isOpen,
  onClose,
  onDispatch,
}: DispatchSurveyModalProps) {
  const [patientName, setPatientName] = useState("Vandana Saxena");
  const [patientUhid, setPatientUhid] = useState("UHID-2026-9921");
  const [departmentName, setDepartmentName] = useState("Orthopaedics");
  const [doctorName, setDoctorName] = useState("Dr. Rajesh Sharma");
  const [channel, setChannel] = useState<"WhatsApp" | "SMS">("WhatsApp");
  const [score, setScore] = useState<number>(10);
  const [feedbackText, setFeedbackText] = useState(
    "Physiotherapy team was exceptional during my stay."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const category = score >= 9 ? "Promoter" : score >= 7 ? "Passive" : "Detractor";

    const surveyResponse: NPSSurveyResponse = {
      id: `nps-${Date.now()}`,
      patientId: patientUhid,
      patientName,
      encounterId: `IPD-ENC-${Math.floor(1000 + Math.random() * 9000)}`,
      score,
      category,
      feedbackText,
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      triggeredByDischargeId: `DISCH-${Date.now().toString().slice(-4)}`,
      dispatchedViaChannel: channel,
      departmentName,
      doctorName,
      followupRequired: score <= 6,
    };

    onDispatch(surveyResponse);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">
              Module F23 Gateway
            </Badge>
            <DialogTitle className="text-base font-bold">
              Dispatch Post-Discharge NPS Survey
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Test survey dispatch triggered upon patient discharge (F5) and delivered via Communication Hub (F23 WhatsApp/SMS).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Patient Name
              </label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="h-8 text-xs font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Patient UHID
              </label>
              <Input
                value={patientUhid}
                onChange={(e) => setPatientUhid(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Department
              </label>
              <Input
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Attending Doctor
              </label>
              <Input
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Delivery Channel */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Delivery Channel (via F23 Gateway)
            </label>
            <Select value={channel} onValueChange={(val) => setChannel(val as "WhatsApp" | "SMS")}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WhatsApp">WhatsApp Business API (Interactive Template)</SelectItem>
                <SelectItem value="SMS">Transactional SMS (Short URL Link)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* WhatsApp Interactive Preview Frame */}
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300 text-[11px]">
              <Smartphone className="h-3.5 w-3.5" />
              WhatsApp Message Preview
            </div>
            <div className="rounded bg-card border border-border p-2.5 text-[11px] space-y-2 shadow-sm text-foreground">
              <p className="text-muted-foreground">
                Dear <span className="font-semibold text-foreground">{patientName}</span>, thank you for choosing Qlyno Hospital for your recent care under{" "}
                <span className="font-semibold text-foreground">{doctorName}</span> ({departmentName}).
              </p>
              <p className="font-medium text-foreground">
                How likely are you to recommend our hospital to your family and friends? (0 = Not at all, 10 = Extremely likely)
              </p>

              {/* Interactive 0-10 score buttons simulator */}
              <div className="flex flex-wrap gap-1 pt-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScore(s)}
                    className={`h-6 w-6 rounded text-[10px] font-bold border transition-colors ${
                      score === s
                        ? s >= 9
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : s >= 7
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-rose-500 text-white border-rose-500"
                        : "bg-muted text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Simulated Patient Remarks (Optional)
            </label>
            <Input
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="h-8 text-xs"
              placeholder="e.g. Clean rooms, compassionate staff..."
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Dispatch & Record Response
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
