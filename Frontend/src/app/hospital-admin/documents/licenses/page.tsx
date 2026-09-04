"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Award,
  Upload,
  Search,
  ShieldCheck,
  Eye,
  ExternalLink,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { DocumentsNav } from "@/hospital-admin/components/documents/documents-nav";
import { UploadDocumentModal } from "@/hospital-admin/components/documents/UploadDocumentModal";
import { DocumentViewerModal } from "@/hospital-admin/components/documents/DocumentViewerModal";
import { addDocument } from "@/hospital-admin/store/slices/documentsSlice";
import { HospitalDocumentItem } from "@/hospital-admin/lib/types/documents";
import { mockHospitalDocuments } from "@/hospital-admin/lib/mock-data/documents";

export default function LicensesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const documents = useSelector(
    (s: RootState) => s.documents?.documents || mockHospitalDocuments
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<HospitalDocumentItem | null>(null);

  const licenseDocs = documents
    .filter((d) => d.category === "Licenses")
    .filter((d) => {
      return (
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.linkedEntityName && d.linkedEntityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.issuerAuthority && d.issuerAuthority.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

  const handleUpload = (newDoc: HospitalDocumentItem) => {
    dispatch(addDocument(newDoc));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Professional Credentials
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Staff Medical Licensing & Credential Vault
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              State Medical Council registrations, nursing council licenses, BLS/ACLS/ATLS certifications, and Radiation Safety Officer (RSO) approvals — cross-referenced with Verification (Module 13).
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="h-8 gap-1 text-xs bg-primary text-primary-foreground"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Professional License
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <DocumentsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Banner cross-referencing Module 13 */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">
                Verification Module 13 Synchronized Vault
              </span>
              <p className="text-muted-foreground text-[11px]">
                Licenses are indexed from Module 13&apos;s verified credential data and monitored with automated 30/60/90-day statutory expiry alerts.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-7 text-xs gap-1 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
          >
            <a href="/hospital-admin/verification/expiry-alerts">
              <span>View Expiry Alerts</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by practitioner name, registration code, or council..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <Badge variant="outline" className="text-xs">
            {licenseDocs.length} Active Licenses
          </Badge>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {licenseDocs.map((doc) => (
            <Card
              key={doc.id}
              className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {doc.documentCode}
                      </Badge>
                      <Badge className="ml-1 bg-primary/10 text-primary border border-primary/20 text-[10px]">
                        {doc.version}
                      </Badge>
                    </div>
                  </div>

                  {doc.redactionStatus === "PII Redacted (Rule 13.1 Verified)" && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Rule 13.1
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-sm font-semibold mt-2 text-foreground line-clamp-2">
                  {doc.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {doc.subCategory}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                <div className="space-y-1 text-xs text-muted-foreground border-t border-border/60 pt-2">
                  {doc.linkedEntityName && (
                    <div className="flex justify-between">
                      <span>Practitioner:</span>
                      <span className="font-semibold text-primary">{doc.linkedEntityName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Accrediting Council:</span>
                    <span className="text-foreground truncate max-w-[180px]">{doc.issuerAuthority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Till:</span>
                    <span className="font-mono text-foreground">{doc.expiryDate || "Lifetime"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Classification:</span>
                    <span className="font-medium text-foreground">{doc.securityClassification}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                  {doc.evidenceViewerUrl ? (
                    <a
                      href={doc.evidenceViewerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline text-[11px] flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Evidence Viewer
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {doc.fileSize} • {doc.fileType}
                    </span>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDoc(doc)}
                    className="h-7 text-xs gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Inspect Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        defaultCategory="Licenses"
      />

      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
      />
    </div>
  );
}
