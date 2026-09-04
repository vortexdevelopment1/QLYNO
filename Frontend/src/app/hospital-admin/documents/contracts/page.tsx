"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { DocumentsNav } from "@/hospital-admin/components/documents/documents-nav";
import { RegisterContractModal } from "@/hospital-admin/components/documents/RegisterContractModal";
import { ViewAgreementModal } from "@/hospital-admin/components/documents/ViewAgreementModal";
import { registerContract } from "@/hospital-admin/store/slices/documentsSlice";
import { ContractItem } from "@/hospital-admin/lib/types/documents";
import { mockContracts } from "@/hospital-admin/lib/mock-data/documents";

export default function ContractsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const contracts = useSelector(
    (s: RootState) => s.documents?.contracts || mockContracts
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedContractForView, setSelectedContractForView] = useState<ContractItem | null>(null);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.assetName && c.assetName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === "all" || c.contractType === selectedType;

    return matchesSearch && matchesType;
  });

  const handleRegister = (newContract: ContractItem) => {
    dispatch(registerContract(newContract));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Agreements & SLAs
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Vendor Supply Agreements & Biomedical AMC/CMC Contracts
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Equipment maintenance SLAs, consumables supply agreements, pharmacy purchase contracts, and facility SLAs (linked to Module 11 Procurement & Module F20 Assets).
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            className="h-8 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Register Contract
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <DocumentsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Banner cross-referencing Module 11 & F20 */}
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">
                Integrated with Procurement (Module 11) & Asset AMC (F20)
              </span>
              <p className="text-muted-foreground text-[11px]">
                Contract terms synchronize with live purchase orders, goods receipt notes (GRN), and asset uptime tracking without duplicated data.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-7 text-xs gap-1 border-indigo-500/40 text-indigo-600 hover:bg-indigo-500/10"
          >
            <a href="/hospital-admin/procurement">
              <span>Open Procurement</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by contract title, vendor name, or equipment..."
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
              All ({contracts.length})
            </Button>
            <Button
              size="sm"
              variant={selectedType === "Biomedical AMC/CMC" ? "default" : "outline"}
              onClick={() => setSelectedType("Biomedical AMC/CMC")}
              className="h-8 text-xs"
            >
              Biomedical AMC
            </Button>
            <Button
              size="sm"
              variant={selectedType === "Pharmacy Purchase Agreement" ? "default" : "outline"}
              onClick={() => setSelectedType("Pharmacy Purchase Agreement")}
              className="h-8 text-xs"
            >
              Pharmacy Supply
            </Button>
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredContracts.map((ctr) => (
            <Card
              key={ctr.id}
              className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] font-bold">
                      {ctr.contractCode}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {ctr.contractType}
                    </Badge>
                  </div>

                  <Badge
                    className={`text-[10px] ${
                      ctr.renewalStatus === "Active"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse"
                    }`}
                  >
                    {ctr.renewalStatus}
                  </Badge>
                </div>

                <CardTitle className="text-sm font-semibold mt-2 text-foreground">
                  {ctr.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Vendor: <strong className="text-foreground">{ctr.vendorName}</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border/60 pt-2">
                  <div>
                    <span>Tenure Period:</span>
                    <span className="font-mono font-semibold text-foreground block">
                      {ctr.startDate} to {ctr.endDate}
                    </span>
                  </div>
                  <div>
                    <span>Annual Value:</span>
                    <span className="font-mono font-bold text-emerald-600 block">
                      {formatCurrency(ctr.annualValue)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span>SLA Commitment:</span>
                    <span className="font-medium text-foreground block">{ctr.slaUptimeCommitment}</span>
                  </div>
                </div>

                {ctr.assetName && (
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/40 text-[11px] text-muted-foreground border border-border/60">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>Linked Asset: <strong className="text-foreground">{ctr.assetName}</strong></span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                  <span className="italic">{ctr.paymentTerms}</span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedContractForView(ctr)}
                    className="h-7 text-xs gap-1"
                  >
                    View Agreement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Register Modal */}
      <RegisterContractModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={handleRegister}
      />

      {/* View Agreement Modal */}
      <ViewAgreementModal
        isOpen={!!selectedContractForView}
        onClose={() => setSelectedContractForView(null)}
        contract={selectedContractForView}
      />
    </div>
  );
}
