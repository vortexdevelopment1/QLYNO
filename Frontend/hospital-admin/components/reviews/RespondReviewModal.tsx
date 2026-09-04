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
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Star, MessageSquare, Sparkles, Send, User } from "lucide-react";
import { PatientReviewItem } from "@/hospital-admin/lib/types/patient-reviews";

interface RespondReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: PatientReviewItem | null;
  onRespond: (reviewId: string, responseText: string, respondedBy: string) => void;
}

const RESPONSE_TEMPLATES = [
  {
    title: "Appreciation (5-Star)",
    text: "Dear {Name}, thank you so much for taking the time to share your positive experience. Our medical and nursing team is dedicated to providing compassionate, world-class care, and your kind words motivate us all. We wish you continued health!",
  },
  {
    title: "Doctor & Nursing Gratitude",
    text: "Dear {Name}, we truly appreciate your appreciation of our clinical team. Ensuring clear communication and empathetic patient care remains our highest priority. Thank you for choosing our hospital.",
  },
  {
    title: "Service Delay Reassurance",
    text: "Dear {Name}, thank you for your candid feedback. We sincerely apologize for the delay you encountered. We have shared your comments with our operations and department leads to optimize queue turnaround times. Our Patient Relations team is available if we can assist further.",
  },
  {
    title: "Billing Clarification & Apology",
    text: "Dear {Name}, we regret the inconvenience caused regarding your billing experience. We strive for complete financial transparency. Our Billing & Insurance Manager has been notified to review your case and ensure seamless service.",
  },
];

export function RespondReviewModal({
  isOpen,
  onClose,
  review,
  onRespond,
}: RespondReviewModalProps) {
  const [responseText, setResponseText] = useState("");
  const [respondedBy, setRespondedBy] = useState("Hospital Administration (Dr. Farooq Abdullah)");

  if (!review) return null;

  const handleApplyTemplate = (templateText: string) => {
    const personalized = templateText.replace("{Name}", review.patientName || "Valued Patient");
    setResponseText(personalized);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    onRespond(review.id, responseText, respondedBy);
    setResponseText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {review.source} Review
            </Badge>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
          <DialogTitle className="text-base font-bold mt-1">
            Respond to Patient Review
          </DialogTitle>
          <DialogDescription className="text-xs">
            Draft and publish an official hospital response attributed to authorized administrative staff.
          </DialogDescription>
        </DialogHeader>

        {/* Patient Review Context Box */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-medium">
            <span className="text-foreground">{review.patientName}</span>
            <span className="text-[11px] text-muted-foreground">{review.submittedAt}</span>
          </div>
          <p className="text-muted-foreground italic">&ldquo;{review.reviewText}&rdquo;</p>
          {(review.linkedDoctorName || review.linkedDepartmentName) && (
            <div className="flex gap-2 pt-1 text-[10px] text-muted-foreground border-t border-border/50">
              {review.linkedDoctorName && <span>Doctor: {review.linkedDoctorName}</span>}
              {review.linkedDepartmentName && <span>Dept: {review.linkedDepartmentName}</span>}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quick Preset Templates */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Quick Response Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RESPONSE_TEMPLATES.map((tmpl) => (
                <Button
                  key={tmpl.title}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplyTemplate(tmpl.text)}
                  className="h-6 text-[10px] px-2"
                >
                  {tmpl.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Response Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Official Hospital Response <span className="text-rose-500">*</span>
            </label>
            <Textarea
              required
              rows={4}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write a personalized, empathetic response to the patient..."
              className="text-xs resize-none"
            />
          </div>

          {/* Responding Staff Attribution */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Responding Staff Attribution
            </label>
            <Input
              value={respondedBy}
              onChange={(e) => setRespondedBy(e.target.value)}
              className="h-8 text-xs font-medium"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!responseText.trim()}
              className="h-8 text-xs gap-1 bg-primary text-primary-foreground"
            >
              <Send className="h-3.5 w-3.5" />
              Post Public Response
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
