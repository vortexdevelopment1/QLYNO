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
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { BookOpen, CheckCircle2, ShieldAlert } from "lucide-react";
import { PolicyTemplateItem } from "@/hospital-admin/lib/types/documents";

interface CreatePolicyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (template: PolicyTemplateItem) => void;
}

export function CreatePolicyTemplateModal({
  isOpen,
  onClose,
  onCreate,
}: CreatePolicyTemplateModalProps) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<PolicyTemplateItem["type"]>("Clinical SOP");
  const [department, setDepartment] = useState("Hospital-Wide");
  const [workflows, setWorkflows] = useState("IPD Ward Discharge, Emergency, ICU");
  const [reviewCycleMonths, setReviewCycleMonths] = useState("12");
  const [approvedBy, setApprovedBy] = useState("Dr. Farooq Abdullah (Medical Superintendent)");
  const [contentBody, setContentBody] = useState(`### Protocol Clauses & Guidelines
1. **Mandatory Standard**: Strict compliance with NABH / ISO clinical hygiene and verification protocols.
2. **Clinical Verification**: Requires attending consultant sign-off prior to procedure initiation.
3. **Audit Trail**: All events must be logged in the nursing station EMR.`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    const newTemplate: PolicyTemplateItem = {
      id: `TMPL-${Date.now()}`,
      code,
      title,
      type,
      department,
      applicableClinicalWorkflows: workflows.split(",").map((w) => w.trim()).filter(Boolean),
      version: "v1.0",
      effectiveDate: new Date().toISOString().substring(0, 10),
      reviewCycleMonths: parseInt(reviewCycleMonths) || 12,
      contentBody,
      isApproved: true,
      approvedBy,
    };

    onCreate(newTemplate);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Draft Clinical SOP or Consent Template
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Creates master reusable templates consumed across IPD, OT, and OPD. (Executed signed copies stay in patient EMRs).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Template Title <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Code Blue Cardiac Resuscitation SOP"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Template Code / SOP ID <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SOP-EMERG-CB-01"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Template Type
              </label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as PolicyTemplateItem["type"])}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clinical SOP">Clinical SOP (Departmental Protocol)</SelectItem>
                  <SelectItem value="Consent Template">Consent Template (Master Blank Form)</SelectItem>
                  <SelectItem value="Institutional Policy">Institutional Policy (HR / Governance)</SelectItem>
                  <SelectItem value="Legal Undertaking">Legal Undertaking (LAMA / Indemnity)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Department Scope
              </label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Applicable Clinical Workflows
              </label>
              <Input
                value={workflows}
                onChange={(e) => setWorkflows(e.target.value)}
                placeholder="Comma separated (e.g. IPD, OT, Emergency)"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Annual Review Cycle (Months)
              </label>
              <Input
                type="number"
                value={reviewCycleMonths}
                onChange={(e) => setReviewCycleMonths(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Standardized Protocol Body / Legal Clauses (Markdown)
            </label>
            <Textarea
              rows={5}
              value={contentBody}
              onChange={(e) => setContentBody(e.target.value)}
              className="text-xs font-mono resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Approved By (Medical Superintendent / Compliance Officer)
            </label>
            <Input
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
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
              className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Publish Master Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
