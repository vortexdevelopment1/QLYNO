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
import { Upload, FileText, ShieldCheck, Lock } from "lucide-react";
import {
  HospitalDocumentItem,
  DocumentCategory,
  SecurityClassification,
} from "@/hospital-admin/lib/types/documents";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: HospitalDocumentItem) => void;
  defaultCategory?: DocumentCategory;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onUpload,
  defaultCategory = "Hospital Documents",
}: UploadDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [documentCode, setDocumentCode] = useState("");
  const [category, setCategory] = useState<DocumentCategory>(defaultCategory);
  const [subCategory, setSubCategory] = useState("Institutional Compliance");
  const [departmentName, setDepartmentName] = useState("Hospital-Wide");
  const [issuerAuthority, setIssuerAuthority] = useState("Directorate of Health Services");
  const [issueDate, setIssueDate] = useState("2026-08-01");
  const [expiryDate, setExpiryDate] = useState("2028-07-31");
  const [securityClassification, setSecurityClassification] =
    useState<SecurityClassification>("Internal Staff Read-Only");
  const [uploadedBy, setUploadedBy] = useState("Hospital Compliance Officer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !documentCode.trim()) return;

    const docId = `DOC-${Date.now()}`;
    const isPublic = securityClassification === "Public Redacted";

    const newDoc: HospitalDocumentItem = {
      id: docId,
      documentCode,
      title,
      category,
      subCategory,
      departmentName,
      version: "v1.0",
      versionHistory: [
        {
          version: "v1.0",
          modifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          modifiedBy: uploadedBy,
          changeSummary: "Initial document upload.",
          fileUrl: `/documents/${documentCode.toLowerCase()}.pdf`,
          fileSize: "2.4 MB",
        },
      ],
      issuerAuthority,
      issueDate,
      expiryDate: expiryDate || null,
      isExpired: false,
      securityClassification,
      isPublicCertificate: isPublic,
      redactionStatus: isPublic ? "PII Redacted (Rule 13.1 Verified)" : "Not Required",
      fileUrl: `/documents/${documentCode.toLowerCase()}.pdf`,
      fileSize: "2.4 MB",
      fileType: "PDF",
      uploadedBy,
      uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      tags: [category, subCategory, departmentName],
    };

    onUpload(newDoc);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Upload className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Upload Document to Hospital DMS
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Ingest policies, licenses, regulatory certificates, or legal contracts with versioning and RBAC classification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Document Title <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Fire Safety Clearance Certificate"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Document Code / Ref No. <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={documentCode}
                onChange={(e) => setDocumentCode(e.target.value)}
                placeholder="e.g. FIRE-NOC-2026-01"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Primary Category
              </label>
              <Select value={category} onValueChange={(val) => setCategory(val as DocumentCategory)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hospital Documents">Hospital Documents (Institutional)</SelectItem>
                  <SelectItem value="Staff Documents">Staff Documents (Personnel Paperwork)</SelectItem>
                  <SelectItem value="Licenses">Licenses (Professional Medical)</SelectItem>
                  <SelectItem value="Certificates">Certificates (Accreditations / Calibration)</SelectItem>
                  <SelectItem value="Policies">Policies (Clinical SOPs / Consent)</SelectItem>
                  <SelectItem value="Contracts">Contracts (Vendor / AMC / SLAs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Sub-Classification
              </label>
              <Input
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Clinical SOP, Statutory NOC"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Issuing Authority / Agency
              </label>
              <Input
                value={issuerAuthority}
                onChange={(e) => setIssuerAuthority(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Department Scope
              </label>
              <Input
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Issue Date
              </label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Expiry Date (if applicable)
              </label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Security & RBAC Classification
            </label>
            <Select
              value={securityClassification}
              onValueChange={(val) => setSecurityClassification(val as SecurityClassification)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Public Redacted">Public Redacted (Rule 13.1 PII Scrubbed for Profile)</SelectItem>
                <SelectItem value="Internal Staff Read-Only">Internal Staff Read-Only (Approved SOPs / General)</SelectItem>
                <SelectItem value="Restricted: Clinical Leads">Restricted: Clinical Leads (Credentials & BGV)</SelectItem>
                <SelectItem value="Confidential: Admin & Compliance">Confidential: Admin & Compliance (Legal & Contracts)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Uploaded By (Staff Attribution)
            </label>
            <Input
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
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
              className="h-8 text-xs gap-1 bg-primary text-primary-foreground"
            >
              <Upload className="h-3.5 w-3.5" />
              Ingest Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
