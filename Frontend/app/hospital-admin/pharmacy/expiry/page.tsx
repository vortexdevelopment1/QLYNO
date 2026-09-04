"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  Layers,
  Lock,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
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
import { PharmacyNav } from "@/hospital-admin/components/pharmacy/pharmacy-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockPharmacyBatchExpiries } from "@/hospital-admin/lib/mock-data/pharmacy-extended-operations";
import { PharmacyBatchExpiry } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacyExpiryPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [batches, setBatches] = useState<PharmacyBatchExpiry[]>(mockPharmacyBatchExpiries);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === "all" || b.fefoPriority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleQuarantineBatch = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, quarantineStatus: "Quarantined" as const } : b))
    );
    const target = batches.find((b) => b.id === batchId);
    toast({
      title: "Batch Quarantined",
      description: `Batch ${target?.batchNumber} (${target?.medicineName}) locked from dispensing. (${DELEGATION_STRING})`,
      variant: "destructive",
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Medication Batch Expiry &amp; FEFO Dispatch Governance"
          description="First-Expiry-First-Out (FEFO) dispensing prioritization, batch lifecycle auditing, and quarantine controls."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Expiry Management" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading expiry tracking...
        </div>
      </div>
    );
  }

  const criticalCount = batches.filter((b) => b.fefoPriority === "Critical (<30d)").length;
  const highCount = batches.filter((b) => b.fefoPriority === "High (<60d)").length;
  const quarantinedCount = batches.filter((b) => b.quarantineStatus === "Quarantined").length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Medication Batch Expiry &amp; FEFO Dispatch Governance"
        description="First-Expiry-First-Out (FEFO) dispensing prioritization, batch lifecycle auditing, and quarantine controls."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Expiry Management" }]}
        actions={
          <Link href="/hospital-admin/pharmacy/sales-returns">
            <Button size="sm" variant="outline" className="gap-1.5 font-semibold text-xs text-primary border-primary/30 hover:bg-primary/10">
              <RefreshCw className="h-4 w-4" /> Expired Stock Write-Off
            </Button>
          </Link>
        }
      />

      <PharmacyNav />

      {/* Scope Indicator & FEFO Rule */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Batch Lifecycle &amp; FEFO Queue" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>FEFO Standard: Earliest expiring batches auto-prioritized in dispensing queues to minimize wastage</span>
        </div>
      </div>

      {/* Critical Expiry Warning */}
      {criticalCount > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/10 shadow-xs">
          <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  EXPIRY NOTICE: {criticalCount} Medication Batch(es) Expiring in &lt;30 Days
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Prioritize these batches for immediate dispensing or initiate vendor return/quarantine protocol.
                </p>
              </div>
            </div>
            <Link href="/hospital-admin/pharmacy/dispensing">
              <Button size="sm" className="text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 shrink-0">
                Dispatch via FEFO
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Expiring &lt;30 Days</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{criticalCount} Batches</p>
          <span className="text-[10px] text-rose-600 font-medium">Critical FEFO dispatch</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Expiring &lt;60 Days</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{highCount} Batches</p>
          <span className="text-[10px] text-amber-600 font-medium">Monitored watchlist</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Quarantined Stock</span>
          <p className="text-xl font-bold font-mono text-muted-foreground mt-0.5">{quarantinedCount} Batches</p>
          <span className="text-[10px] text-muted-foreground">Locked from dispensing</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">FEFO Automated Routing</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Active</p>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-allocated on Rx</span>
        </Card>
      </div>

      {/* Batches Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Pharmaceutical Batch Expiry Registry</CardTitle>
              <CardDescription className="text-xs">
                Inspect manufacturer lot numbers, expiration deadlines, remaining quantities, and trigger safety quarantines.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search batch or medicine..."
                  className="pl-8 text-xs h-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px] text-xs h-8">
                  <SelectValue placeholder="FEFO Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expiries</SelectItem>
                  <SelectItem value="Critical (<30d)">Critical (&lt;30d)</SelectItem>
                  <SelectItem value="High (<60d)">High (&lt;60d)</SelectItem>
                  <SelectItem value="Moderate (<90d)">Moderate (&lt;90d)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[220px]">Medicine / Category</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Batch # &amp; Maker</TableHead>
                  <TableHead className="text-xs font-bold w-[120px]">Expiry Date</TableHead>
                  <TableHead className="text-xs font-bold w-[120px]">Days Left</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Stock Qty</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">FEFO Priority</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{b.medicineName}</div>
                      <div className="text-[10px] text-muted-foreground">{b.category}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-mono text-xs font-bold text-primary">{b.batchNumber}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[130px]">{b.manufacturer}</div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-foreground">
                      {b.expiryDate}
                    </TableCell>

                    <TableCell>
                      <div className="font-mono text-xs font-bold text-rose-600">
                        {b.daysRemaining} Days
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {b.currentStock} Units
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          b.fefoPriority === "Critical (<30d)"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] animate-pulse"
                            : b.fefoPriority === "High (<60d)"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "text-[10px]"
                        }
                      >
                        {b.fefoPriority}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          b.quarantineStatus === "Active Stock"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                        }
                      >
                        {b.quarantineStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {b.quarantineStatus === "Active Stock" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleQuarantineBatch(b.id)}
                        >
                          Quarantine
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Locked</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
