"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  MoreHorizontal,
  Percent,
  Plus,
  Receipt,
  Search,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Users,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { BillingNav } from "@/hospital-admin/components/billing/billing-nav";
import { discountTypesRegistry as initialTypes, invoices } from "@/hospital-admin/lib/mock-data/invoices";
import { DiscountType } from "@/hospital-admin/lib/types";
import { formatCurrency, formatDate } from "@/hospital-admin/lib/utils";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function DiscountsRegistryPage() {
  const [mounted, setMounted] = useState(false);
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>(initialTypes);
  const [activeTab, setActiveTab] = useState("registry");

  // Create Discount Category Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<any>("Senior Citizen");
  const [newPercent, setNewPercent] = useState(10);
  const [newCriteria, setNewCriteria] = useState("");
  const [newRequiresSupervisor, setNewRequiresSupervisor] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateDiscountType = (e: React.FormEvent) => {
    e.preventDefault();
    const newType: DiscountType = {
      id: `DISC-0${discountTypes.length + 1}`,
      name: newName,
      category: newCategory,
      defaultPercentage: Number(newPercent),
      eligibilityCriteria: newCriteria,
      requiresSupervisorApproval: newRequiresSupervisor,
      isActive: true,
    };

    setDiscountTypes((prev) => [...prev, newType]);
    toast({
      title: "Discount Scheme Registered",
      description: `${newName} (${newPercent}%) registered in hospital billing policies.`,
    });
    setCreateModalOpen(false);
    setNewName("");
    setNewCriteria("");
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Category,Default %,Supervisor Required,Status\n" +
      discountTypes
        .map(
          (d) =>
            `${d.id},"${d.name}","${d.category}",${d.defaultPercentage || 0}%,${
              d.requiresSupervisorApproval ? "Yes" : "No"
            },${d.isActive ? "Active" : "Inactive"}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hospital_Discounts_Policy_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Discount Policy Exported",
      description: "Policy registry CSV downloaded for financial auditing.",
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Discounts Registry, Approvals &amp; Audit Reports"
          description="Standard concession policies, staff waivers, high-value discount approval gates, and utilization audits."
          crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "Discounts" }]}
        />
        <BillingNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading discounts system...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Discounts Registry, Approvals &amp; Audit Reports"
        description="Standard concession policies, staff waivers, high-value discount approval gates, and utilization audits."
        crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "Discounts" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 font-semibold text-xs" onClick={handleExportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4" /> Add Discount Policy
            </Button>
          </div>
        }
      />

      <BillingNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Discount Schemes</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{discountTypes.length} Policies</p>
          <span className="text-[10px] text-primary font-medium">Standardized tariff concessions</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Senior Citizen Concessions</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">15% Standard</p>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-eligible on age verification</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Charity Relief Waivers</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">100% Full Waiver</p>
          <span className="text-[10px] text-cyan-600 font-medium">Medical Superintendent approval</span>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 border border-border">
          <TabsTrigger value="registry" className="text-xs">
            Discount Policies Registry ({discountTypes.length})
          </TabsTrigger>
          <TabsTrigger value="audit-logs" className="text-xs">
            Discount Audit Trail
          </TabsTrigger>
          <TabsTrigger value="utilization" className="text-xs">
            Departmental Utilization Report
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Policies Registry */}
        <TabsContent value="registry" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Hospital Tariff Discount Categories</CardTitle>
              <CardDescription className="text-xs">
                Pre-configured concession types selectable during invoice generation with strict eligibility rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Policy Code</TableHead>
                      <TableHead className="text-xs font-bold">Policy Name &amp; Category</TableHead>
                      <TableHead className="text-xs font-bold">Concession %</TableHead>
                      <TableHead className="text-xs font-bold">Mandatory Eligibility Criteria</TableHead>
                      <TableHead className="text-xs font-bold">Approval Gate</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discountTypes.map((type) => (
                      <TableRow key={type.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-foreground">{type.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{type.name}</div>
                          <div className="text-[10px] text-muted-foreground">{type.category}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-emerald-600">
                          {type.defaultPercentage}%
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[280px]">
                          {type.eligibilityCriteria}
                        </TableCell>
                        <TableCell>
                          {type.requiresSupervisorApproval ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                              Supervisor Sign-Off Required
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                              Cashier Auto-Approved
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                            Active Policy
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Discount Audit Trail */}
        <TabsContent value="audit-logs" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Discount Audit &amp; Application Log</CardTitle>
              <CardDescription className="text-xs">
                Immutable audit trail tracking who applied which discount, on which invoice, and approving supervisor.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Invoice #</TableHead>
                      <TableHead className="text-xs font-bold">Patient Name</TableHead>
                      <TableHead className="text-xs font-bold">Applied Discount Scheme</TableHead>
                      <TableHead className="text-xs font-bold">Concession Amount</TableHead>
                      <TableHead className="text-xs font-bold">Applied By (Cashier)</TableHead>
                      <TableHead className="text-xs font-bold">Audit Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-xs font-bold text-primary">INV-2026-08-1042</TableCell>
                      <TableCell className="text-xs font-semibold">Aarav Shah</TableCell>
                      <TableCell className="text-xs">Senior Citizen Concession (60+ Years)</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-emerald-600">₹200 (15%)</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Rohit Kadam (OPD Cashier)</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                          Applied &amp; Verified
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Departmental Utilization */}
        <TabsContent value="utilization" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Departmental Discount Utilization Breakdown</CardTitle>
              <CardDescription className="text-xs">
                Aggregate concession totals feeding monthly hospital P&amp;L financial reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-3.5 border-border bg-card">
                  <span className="text-xs font-bold text-muted-foreground">Cardiology &amp; Medicine</span>
                  <p className="text-xl font-bold font-mono text-emerald-600 mt-1">₹14,500</p>
                  <span className="text-[10px] text-muted-foreground">Senior citizen concessions</span>
                </Card>
                <Card className="p-3.5 border-border bg-card">
                  <span className="text-xs font-bold text-muted-foreground">Orthopedics &amp; Surgery</span>
                  <p className="text-xl font-bold font-mono text-primary mt-1">₹45,000</p>
                  <span className="text-[10px] text-muted-foreground">Corporate partner pre-negotiated</span>
                </Card>
                <Card className="p-3.5 border-border bg-card">
                  <span className="text-xs font-bold text-muted-foreground">Charity Medical Trust</span>
                  <p className="text-xl font-bold font-mono text-cyan-600 mt-1">₹85,000</p>
                  <span className="text-[10px] text-muted-foreground">Compassionate relief waivers</span>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Discount Scheme Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateDiscountType}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" /> Register New Discount Policy
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add a new standardized concession rule with approval thresholds.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="disc-name">Discount Policy Name</Label>
                <Input
                  id="disc-name"
                  required
                  placeholder="e.g. Armed Forces Veteran Concession"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="disc-cat">Policy Category</Label>
                  <Select value={newCategory} onValueChange={(val: any) => setNewCategory(val)}>
                    <SelectTrigger id="disc-cat" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior Citizen">Senior Citizen</SelectItem>
                      <SelectItem value="Staff Discount">Staff Discount</SelectItem>
                      <SelectItem value="Corporate / Insurance Rate">Corporate / TPA</SelectItem>
                      <SelectItem value="Promotional Camp">Promotional Camp</SelectItem>
                      <SelectItem value="Compassionate Waiver">Compassionate Waiver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="disc-pct">Default Discount %</Label>
                  <Input
                    id="disc-pct"
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={newPercent}
                    onChange={(e) => setNewPercent(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="disc-crit">Mandatory Eligibility Criteria</Label>
                <Input
                  id="disc-crit"
                  required
                  placeholder="e.g. Ex-Servicemen Contributory Health Card (ECHS)"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="disc-sup"
                  checked={newRequiresSupervisor}
                  onChange={(e) => setNewRequiresSupervisor(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <Label htmlFor="disc-sup" className="cursor-pointer">
                  Mandatory Supervisor Sign-Off Required for Application
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Register Policy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
