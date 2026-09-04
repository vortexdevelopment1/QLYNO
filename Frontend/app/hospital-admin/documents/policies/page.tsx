"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  FileCheck,
  Building2,
  Eye,
  Layers,
  Lock,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { DocumentsNav } from "@/hospital-admin/components/documents/documents-nav";
import { CreatePolicyTemplateModal } from "@/hospital-admin/components/documents/CreatePolicyTemplateModal";
import { addPolicyTemplate } from "@/hospital-admin/store/slices/documentsSlice";
import { PolicyTemplateItem } from "@/hospital-admin/lib/types/documents";
import { mockPolicyTemplates } from "@/hospital-admin/lib/mock-data/documents";

export default function PoliciesAndTemplatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const templates = useSelector(
    (s: RootState) => s.documents?.policyTemplates || mockPolicyTemplates
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activePreviewTemplate, setActivePreviewTemplate] =
    useState<PolicyTemplateItem | null>(null);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.applicableClinicalWorkflows.some((w) =>
        w.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesType = selectedType === "all" || t.type === selectedType;

    return matchesSearch && matchesType;
  });

  const handleCreate = (newTemplate: PolicyTemplateItem) => {
    dispatch(addPolicyTemplate(newTemplate));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                Protocols & Governance
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Clinical SOPs, Institutional Policies & Master Consent Templates
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              NABH/ISO departmental protocols and master reusable blank consent forms consumed across IPD, OT, and OPD workflows.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            New Policy / Consent Template
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <DocumentsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Template vs. Instance Distinction Notice */}
        <div className="rounded-lg border border-teal-500/30 bg-teal-500/5 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-teal-600 shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">
                Master Blank Templates vs. Executed Patient Instances
              </span>
              <p className="text-muted-foreground text-[11px]">
                This library stores master blank consent and clinical protocol templates. Executed, patient-signed consent forms stay attached to the patient&apos;s EMR encounter in IPD/OT/OPD (never stored in this general library).
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            Rule CANNOT-6 Enforced
          </Badge>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by protocol title, SOP code, or clinical workflow..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              className="h-8 text-xs"
            >
              All ({templates.length})
            </Button>
            <Button
              size="sm"
              variant={selectedType === "Clinical SOP" ? "default" : "outline"}
              onClick={() => setSelectedType("Clinical SOP")}
              className="h-8 text-xs"
            >
              Clinical SOPs
            </Button>
            <Button
              size="sm"
              variant={selectedType === "Consent Template" ? "default" : "outline"}
              onClick={() => setSelectedType("Consent Template")}
              className="h-8 text-xs"
            >
              Consent Templates
            </Button>
            <Button
              size="sm"
              variant={selectedType === "Legal Undertaking" ? "default" : "outline"}
              onClick={() => setSelectedType("Legal Undertaking")}
              className="h-8 text-xs"
            >
              Legal Undertakings
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredTemplates.map((tmpl) => (
            <Card
              key={tmpl.id}
              className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] font-bold">
                      {tmpl.code}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {tmpl.type}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
                      {tmpl.version}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approved</span>
                  </div>
                </div>

                <CardTitle className="text-sm font-semibold mt-2 text-foreground">
                  {tmpl.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Scope: {tmpl.department} • Review Cycle: Every {tmpl.reviewCycleMonths} Months
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {/* Workflows Tags */}
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    Applicable Clinical Workflows:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.applicableClinicalWorkflows.map((wf) => (
                      <span
                        key={wf}
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {wf}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Body Preview */}
                <div className="rounded-lg bg-muted/40 p-3 border border-border/60 text-xs font-mono whitespace-pre-line text-foreground/90 line-clamp-3">
                  {tmpl.contentBody}
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                  <span>Sign-off: <strong className="text-foreground">{tmpl.approvedBy}</strong></span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActivePreviewTemplate(tmpl)}
                    className="h-7 text-xs gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Read Full Protocol
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Protocol Reader Modal */}
      {activePreviewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePreviewTemplate(null)}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {activePreviewTemplate.code}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {activePreviewTemplate.type}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground mt-2">
                  {activePreviewTemplate.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Department: {activePreviewTemplate.department} • Effective: {activePreviewTemplate.effectiveDate}
                </p>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActivePreviewTemplate(null)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-xs font-sans whitespace-pre-line leading-relaxed text-foreground space-y-2">
              {activePreviewTemplate.contentBody}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
              <span>Approved by {activePreviewTemplate.approvedBy}</span>
              <Button
                size="sm"
                onClick={() => setActivePreviewTemplate(null)}
                className="h-8 text-xs"
              >
                Close Protocol
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreatePolicyTemplateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
