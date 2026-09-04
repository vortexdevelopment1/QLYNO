"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { VerificationNav } from "@/hospital-admin/components/verification/verification-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockExpiryAlerts } from "@/hospital-admin/lib/mock-data/verification-cases";
import { ExpiryAlertItem } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Verification Expiry Tracking workflow";

export default function VerificationExpiryAlertsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [alerts, setAlerts] = useState<ExpiryAlertItem[]>(mockExpiryAlerts);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Renewal Upload Modal State
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ExpiryAlertItem | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState("2028-12-31");
  const [renewalDocNumber, setRenewalDocNumber] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      const matchesSearch =
        item.documentName.toLowerCase().includes(search.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        item.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.issuingAuthority.toLowerCase().includes(search.toLowerCase());

      const matchesUrgency = urgencyFilter === "all" || item.urgency === urgencyFilter;

      return matchesSearch && matchesUrgency;
    });
  }, [alerts, search, urgencyFilter]);

  const handleOpenRenewal = (item: ExpiryAlertItem) => {
    setSelectedAlert(item);
    setRenewalDocNumber(item.licenseNumber);
    setRenewalModalOpen(true);
  };

  const handleSaveRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setAlerts((prev) =>
      prev.map((item) =>
        item.id === selectedAlert.id
          ? {
              ...item,
              status: "Renewal Submitted",
              urgency: "Medium (<60 Days)",
              publicImpact: "Renewal submitted for platform audit. Grace period active.",
            }
          : item
      )
    );

    toast({
      title: "Renewal Document Submitted",
      description: `Renewal for ${selectedAlert.documentName} submitted to Platform Trust team. (${DELEGATION_STRING})`,
    });

    setRenewalModalOpen(false);
    setSelectedAlert(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Verification Expiry &amp; Recertification Alerts"
          description="Early warning tracking for hospital licenses, medical council registrations, and safety NOCs approaching expiry."
          crumbs={[{ label: "Administration" }, { label: "Verifications", href: "/hospital-admin/verification" }, { label: "Expiry Alerts" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading expiry alerts...
        </div>
      </div>
    );
  }

  const expiredCount = alerts.filter((a) => a.daysRemaining <= 0).length;
  const criticalCount = alerts.filter((a) => a.daysRemaining > 0 && a.daysRemaining <= 30).length;
  const mediumCount = alerts.filter((a) => a.daysRemaining > 30 && a.daysRemaining <= 60).length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Verification Expiry &amp; Recertification Alerts"
        description="Early warning tracking for hospital licenses, medical council registrations, and safety NOCs approaching expiry."
        crumbs={[{ label: "Administration" }, { label: "Verifications", href: "/hospital-admin/verification" }, { label: "Expiry Alerts" }]}
      />

      <VerificationNav />

      {/* Scope Indicator & Licensure Compliance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Credential Expiry Compliance Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Licensure Standard: Lapsed medical council registrations trigger immediate real-time status downgrade</span>
        </div>
      </div>

      {/* Immediate Downgrade Emergency Warning */}
      {expiredCount > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/10 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-300">
                  REAL-TIME DOWNGRADE ACTIVE: {expiredCount} Certification(s) Expired
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Public verification badges have been automatically revoked in real time due to license expiry. Upload renewal certificates to reinstate public search listing.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs font-semibold shrink-0"
              onClick={() => setUrgencyFilter("Critical Expired")}
            >
              Filter Expired Documents
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Tracked Certifications</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{alerts.length} Licenses</p>
          <span className="text-[10px] text-muted-foreground">Monitored compliance items</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Expired (Lapsed)</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{expiredCount} Lapsed</p>
          <span className="text-[10px] text-rose-600 font-medium">Public status revoked</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Expiring in &lt; 30 Days</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{criticalCount} Documents</p>
          <span className="text-[10px] text-amber-600 font-medium">Urgent renewal required</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Expiring in &lt; 60 Days</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{mediumCount} Documents</p>
          <span className="text-[10px] text-cyan-600 font-medium">Renewal in preparation</span>
        </Card>
      </div>

      {/* Expiry Alerts Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Document Expiry &amp; Compliance Audit Table</CardTitle>
          <CardDescription className="text-xs">
            Review days-remaining indicators, issuing authorities, and trigger renewal uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search document, subject, or authority..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[180px] text-xs h-9">
                <SelectValue placeholder="Urgency Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency Levels</SelectItem>
                <SelectItem value="Critical Expired">Critical Expired</SelectItem>
                <SelectItem value="High (<30 Days)">High (&lt;30 Days)</SelectItem>
                <SelectItem value="Medium (<60 Days)">Medium (&lt;60 Days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[220px]">Document &amp; License #</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Subject / Entity</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Issuing Authority</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Expiry Date</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Days Remaining</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Public Visibility Impact</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[140px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      No documents match your active filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{item.documentName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{item.licenseNumber}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-medium text-foreground">{item.subjectName}</div>
                        <Badge variant="outline" className="text-[9px] mt-0.5">
                          {item.subjectType}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {item.issuingAuthority}
                      </TableCell>

                      <TableCell className="font-mono text-xs font-semibold">
                        {item.expiryDate}
                      </TableCell>

                      <TableCell>
                        {item.daysRemaining <= 0 ? (
                          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-mono animate-pulse">
                            Expired ({Math.abs(item.daysRemaining)}d ago)
                          </Badge>
                        ) : item.daysRemaining <= 30 ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-mono">
                            {item.daysRemaining} Days Left
                          </Badge>
                        ) : (
                          <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px] font-mono">
                            {item.daysRemaining} Days Left
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-[11px] text-muted-foreground">
                        {item.publicImpact}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-primary text-primary-foreground font-semibold"
                          onClick={() => handleOpenRenewal(item)}
                        >
                          <Upload className="h-3 w-3 mr-1" /> Upload Renewal
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL: UPLOAD RENEWAL DOCUMENT */}
      <Dialog open={renewalModalOpen} onOpenChange={setRenewalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveRenewal}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Upload License Renewal
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit updated renewal certificate for {selectedAlert?.documentName}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="p-2.5 rounded border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground block">Subject:</span>
                <span className="font-bold text-foreground">{selectedAlert?.subjectName}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">Current Exp: {selectedAlert?.expiryDate}</span>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ren-doc">Renewed License / Document Number *</Label>
                <Input
                  id="ren-doc"
                  required
                  value={renewalDocNumber}
                  onChange={(e) => setRenewalDocNumber(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ren-exp">New Expiry Date *</Label>
                <Input
                  id="ren-exp"
                  type="date"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                />
              </div>

              <div className="p-3 border-2 border-dashed border-primary/40 rounded-lg text-center bg-primary/5 space-y-1">
                <Upload className="h-5 w-5 text-primary mx-auto" />
                <span className="font-bold text-xs text-primary block">Attach Renewal Certificate PDF</span>
                <span className="text-[10px] text-muted-foreground">Certified Digital Copy up to 10 MB</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRenewalModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Submit Renewal for Audit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
