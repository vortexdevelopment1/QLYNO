"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  FileText,
  Building2,
  Users,
  Award,
  ShieldCheck,
  BookOpen,
  Briefcase,
  Upload,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ExternalLink,
  Eye,
  Lock,
  History,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { DocumentsNav } from "@/hospital-admin/components/documents/documents-nav";
import { UploadDocumentModal } from "@/hospital-admin/components/documents/UploadDocumentModal";
import { CreatePolicyTemplateModal } from "@/hospital-admin/components/documents/CreatePolicyTemplateModal";
import { RegisterContractModal } from "@/hospital-admin/components/documents/RegisterContractModal";
import { DocumentViewerModal } from "@/hospital-admin/components/documents/DocumentViewerModal";
import {
  addDocument,
  addPolicyTemplate,
  registerContract,
} from "@/hospital-admin/store/slices/documentsSlice";
import {
  HospitalDocumentItem,
  PolicyTemplateItem,
  ContractItem,
  DocumentCategory,
} from "@/hospital-admin/lib/types/documents";
import {
  mockHospitalDocuments,
  mockDmsAnalyticsSummary,
} from "@/hospital-admin/lib/mock-data/documents";

export default function DocumentsOverviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const documents = useSelector((s: RootState) => s.documents?.documents || mockHospitalDocuments);
  const analytics = useSelector((s: RootState) => s.documents?.analytics || mockDmsAnalyticsSummary);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<HospitalDocumentItem | null>(null);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.departmentName && doc.departmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.linkedEntityName && doc.linkedEntityName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleUpload = (newDoc: HospitalDocumentItem) => {
    dispatch(addDocument(newDoc));
  };

  const handleCreatePolicy = (newPolicy: PolicyTemplateItem) => {
    dispatch(addPolicyTemplate(newPolicy));
  };

  const handleRegisterContract = (newContract: ContractItem) => {
    dispatch(registerContract(newContract));
  };

  const categoryCards = [
    {
      title: "Hospital Documents",
      description: "Institution registrations, PCB clearances, Fire NOCs, and Board resolutions.",
      href: "/hospital-admin/documents/hospital-documents",
      icon: Building2,
      count: documents.filter((d) => d.category === "Hospital Documents").length,
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    {
      title: "Staff Documents",
      description: "Employment agreements, BGV reports, offer letters, and ID proofs.",
      href: "/hospital-admin/documents/staff-documents",
      icon: Users,
      count: documents.filter((d) => d.category === "Staff Documents").length,
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    {
      title: "Licenses",
      description: "State Medical Council, nursing licenses, BLS/ACLS credentials (cross-refs Module 13).",
      href: "/hospital-admin/documents/licenses",
      icon: Award,
      count: documents.filter((d) => d.category === "Licenses").length,
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      title: "Certificates",
      description: "NABH/NABL accreditations, AERB permits, ambulance fitness, and asset calibration.",
      href: "/hospital-admin/documents/certificates",
      icon: ShieldCheck,
      count: documents.filter((d) => d.category === "Certificates").length,
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      title: "Policies & Templates",
      description: "Clinical SOPs, infection protocols, and blank consent form master templates.",
      href: "/hospital-admin/documents/policies",
      icon: BookOpen,
      count: documents.filter((d) => d.category === "Policies").length,
      badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    },
    {
      title: "Contracts",
      description: "Vendor supply agreements, biomedical AMC/CMC contracts, and facility SLAs.",
      href: "/hospital-admin/documents/contracts",
      icon: Briefcase,
      count: documents.filter((d) => d.category === "Contracts").length,
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Hospital DMS (F27)
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Document Management System & Compliance Vault
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Institutional repository substrate for clinical SOPs, credential licensing, statutory certificates, master consent templates, and vendor contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPolicyModalOpen(true)}
              className="h-8 gap-1 text-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              New Policy / SOP
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsContractModalOpen(true)}
              className="h-8 gap-1 text-xs"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Register Contract
            </Button>
            <Button
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="h-8 gap-1 text-xs bg-primary text-primary-foreground"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <DocumentsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Ingested</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-foreground">{analytics.totalDocumentsCount}</span>
                <span className="text-[10px] text-muted-foreground">docs</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active SOPs & Policies</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-teal-600">{analytics.activePoliciesCount}</span>
                <span className="text-[10px] text-muted-foreground">protocols</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Staff Licenses</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-amber-600">{analytics.professionalLicensesCount}</span>
                <span className="text-[10px] text-muted-foreground">vault</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Accreditations</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-emerald-600">{analytics.regulatoryCertificatesCount}</span>
                <span className="text-[10px] text-muted-foreground">statutory</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active Contracts</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-indigo-600">{analytics.activeContractsCount}</span>
                <span className="text-[10px] text-muted-foreground">AMC/SLAs</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">30-Day Expiries</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-rose-600">{analytics.expiringIn30DaysCount}</span>
                <span className="text-[10px] text-rose-600">action req</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repository Category Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card
                key={cat.title}
                className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {cat.title}
                        </CardTitle>
                        <Badge className={`text-[10px] mt-0.5 ${cat.badgeColor}`}>
                          {cat.count} Records
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="pt-2 border-t border-border/60 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="h-7 text-xs gap-1 text-primary hover:text-primary"
                    >
                      <Link href={cat.href}>
                        <span>Explore Category</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Master Document Ledger */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Master Repository Index & Ledger
                </CardTitle>
                <CardDescription className="text-xs">
                  All active documents across institutional, clinical, personnel, and contractual categories.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search code, title, department, entity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                    className="h-8 text-xs"
                  >
                    All ({documents.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "Hospital Documents" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("Hospital Documents")}
                    className="h-8 text-xs"
                  >
                    Hospital
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "Licenses" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("Licenses")}
                    className="h-8 text-xs"
                  >
                    Licenses
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "Certificates" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("Certificates")}
                    className="h-8 text-xs"
                  >
                    Certificates
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "Policies" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("Policies")}
                    className="h-8 text-xs"
                  >
                    Policies
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === "Contracts" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("Contracts")}
                    className="h-8 text-xs"
                  >
                    Contracts
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-lg border border-border/80 p-3.5 bg-card hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {doc.documentCode}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {doc.category}
                      </Badge>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
                        {doc.version}
                      </Badge>
                      {doc.redactionStatus === "PII Redacted (Rule 13.1 Verified)" && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Rule 13.1 Verified
                        </Badge>
                      )}
                      {doc.expiryAlertDays && (
                        <Badge variant="destructive" className="text-[10px] animate-pulse">
                          Expiring in {doc.expiryAlertDays} Days
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-semibold text-foreground text-xs">{doc.title}</h4>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Scope: <strong className="text-foreground">{doc.departmentName || "Hospital-Wide"}</strong></span>
                      <span>•</span>
                      <span>Issuer: <strong className="text-foreground">{doc.issuerAuthority}</strong></span>
                      {doc.linkedEntityName && (
                        <>
                          <span>•</span>
                          <span>Linked: <strong className="text-primary">{doc.linkedEntityName}</strong></span>
                        </>
                      )}
                      {doc.expiryDate && (
                        <>
                          <span>•</span>
                          <span>Valid Till: <strong className="text-foreground font-mono">{doc.expiryDate}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {doc.evidenceViewerUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-7 text-xs gap-1 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                      >
                        <a href={doc.evidenceViewerUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          Module 13 Link
                        </a>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDocument(doc)}
                      className="h-7 text-xs gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Inspect & Audit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <CreatePolicyTemplateModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onCreate={handleCreatePolicy}
      />

      <RegisterContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onRegister={handleRegisterContract}
      />

      <DocumentViewerModal
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        document={selectedDocument}
      />
    </div>
  );
}
