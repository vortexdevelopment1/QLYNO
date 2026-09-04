"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Users,
  Upload,
  Search,
  ShieldCheck,
  Eye,
  Lock,
  UserCheck,
  Building2,
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

export default function StaffDocumentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const documents = useSelector(
    (s: RootState) => s.documents?.documents || mockHospitalDocuments
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<HospitalDocumentItem | null>(null);

  const staffDocs = documents
    .filter((d) => d.category === "Staff Documents")
    .filter((d) => {
      return (
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.linkedEntityName && d.linkedEntityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.departmentName && d.departmentName.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                Personnel Paperwork
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Staff Documents & Personnel Records
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Employment agreements, offer letters, background verification (BGV) reports, and NDAs linked directly to Doctor, Nursing, and Support Staff records.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="h-8 gap-1 text-xs bg-primary text-primary-foreground"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Staff Document
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <DocumentsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Search & Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by staff name, employee ID, or document code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <Badge variant="outline" className="text-xs">
            {staffDocs.length} Personnel Records
          </Badge>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffDocs.map((doc) => (
            <Card
              key={doc.id}
              className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                      <Users className="h-4 w-4" />
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

                  <Badge variant="secondary" className="text-[10px]">
                    {doc.linkedEntityType || "Staff"}
                  </Badge>
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
                      <span>Staff Member:</span>
                      <span className="font-semibold text-primary">{doc.linkedEntityName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <span className="font-medium text-foreground">{doc.departmentName || "General"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified By:</span>
                    <span className="text-foreground">{doc.issuerAuthority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Classification:</span>
                    <span className="font-medium text-foreground">{doc.securityClassification}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {doc.fileSize} • {doc.fileType}
                  </span>

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
        defaultCategory="Staff Documents"
      />

      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
      />
    </div>
  );
}
