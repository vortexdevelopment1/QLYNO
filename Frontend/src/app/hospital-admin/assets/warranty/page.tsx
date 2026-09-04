"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  User,
  History,
  FileText,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Label } from "@/hospital-admin/components/ui/label";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AssetsNav } from "@/hospital-admin/components/assets/assets-nav";
import { mockBiomedicalAssetsExtended, mockAssetHistoryEvents } from "@/hospital-admin/lib/mock-data/assets-extended";
import { BiomedicalAsset, AssetHistoryEvent } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { AssetHistoryDrawer } from "@/hospital-admin/components/assets/AssetHistoryDrawer";

export default function AssetWarrantyPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [assets, setAssets] = useState<BiomedicalAsset[]>(mockBiomedicalAssetsExtended);
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(mockAssetHistoryEvents);

  const [search, setSearch] = useState("");
  const [contractFilter, setContractFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState<"all" | "30d" | "60d" | "90d">("all");

  const [selectedAsset, setSelectedAsset] = useState<BiomedicalAsset | null>(null);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  const [newExpiryDate, setNewExpiryDate] = useState("2027-12-31");
  const [renewCost, setRenewCost] = useState<number>(150000);
  const [authorizedBy, setAuthorizedBy] = useState("Hospital Procurement & Biomedical In-Charge");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute days to warranty expiry
  const getDaysToExpiry = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date("2026-08-26").getTime(); // fixed reference date for predictability
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.assetCode.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNo.toLowerCase().includes(search.toLowerCase()) ||
        a.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        a.department.toLowerCase().includes(search.toLowerCase());

      const matchesContract = contractFilter === "all" || a.amcCmcContract === contractFilter;

      const days = getDaysToExpiry(a.warrantyExpiry);
      let matchesTier = true;
      if (tierFilter === "30d") matchesTier = days <= 30;
      if (tierFilter === "60d") matchesTier = days <= 60;
      if (tierFilter === "90d") matchesTier = days <= 90;

      return matchesSearch && matchesContract && matchesTier;
    });
  }, [assets, search, contractFilter, tierFilter]);

  const critical30dCount = useMemo(
    () => assets.filter((a) => getDaysToExpiry(a.warrantyExpiry) <= 30).length,
    [assets]
  );
  const urgent60dCount = useMemo(
    () => assets.filter((a) => getDaysToExpiry(a.warrantyExpiry) <= 60).length,
    [assets]
  );
  const underRenewalCount = useMemo(
    () => assets.filter((a) => a.amcCmcContract === "Under Renewal").length,
    [assets]
  );

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const now = new Date().toISOString();
    const refId = `AMC-REN-${Date.now().toString().slice(-4)}`;

    const updatedAsset: BiomedicalAsset = {
      ...selectedAsset,
      amcCmcContract: "Active",
      warrantyExpiry: newExpiryDate,
    };

    const historyEvent: AssetHistoryEvent = {
      id: `evt_${Date.now()}`,
      assetId: selectedAsset.id,
      assetCode: selectedAsset.assetCode,
      assetName: selectedAsset.name,
      eventType: "Warranty Renewed",
      timestamp: now,
      actor: authorizedBy,
      title: `AMC / Warranty Contract Renewed (${refId})`,
      details: `Renewed with ${selectedAsset.vendorName} until ${newExpiryDate}. Contract Fee: ₹${renewCost.toLocaleString(
        "en-IN"
      )}. Authorized by ${authorizedBy}.`,
      referenceId: refId,
    };

    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);

    toast({
      title: "Contract Renewed & Active",
      description: `AMC for ${selectedAsset.assetCode} extended until ${newExpiryDate}. Ref: ${refId}.`,
    });
    setRenewModalOpen(false);
  };

  const openRenew = (asset: BiomedicalAsset) => {
    setSelectedAsset(asset);
    const exp = new Date(asset.warrantyExpiry);
    exp.setFullYear(exp.getFullYear() + 1);
    setNewExpiryDate(exp.toISOString().split("T")[0]);
    setRenewModalOpen(true);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Warranty &amp; AMC / CMC Contract Management"
        description="OEM warranty tracking, Annual Maintenance Contracts (AMC), Comprehensive Maintenance Contracts (CMC), and renewal alerts."
        crumbs={[{ label: "Supply & Assets" }, { label: "Assets" }, { label: "Warranty & AMC" }]}
      />

      <AssetsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="OEM Contract Compliance &amp; Warranty Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F20-CAN-21: Dedicated warranty expiry tracker tiered by days-to-expiration</span>
        </div>
      </div>

      {/* Tiered Expiry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card
          className={`p-3.5 border-border cursor-pointer transition-all ${
            tierFilter === "30d" ? "border-rose-500 ring-1 ring-rose-500 bg-rose-500/5" : "hover:border-rose-500/50"
          }`}
          onClick={() => setTierFilter(tierFilter === "30d" ? "all" : "30d")}
        >
          <span className="text-[11px] text-muted-foreground uppercase font-bold">&lt; 30 Days (Critical)</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{critical30dCount} Contracts</p>
          <span className="text-[10px] text-rose-600 font-medium">Immediate PO renewal required</span>
        </Card>
        <Card
          className={`p-3.5 border-border cursor-pointer transition-all ${
            tierFilter === "60d" ? "border-amber-500 ring-1 ring-amber-500 bg-amber-500/5" : "hover:border-amber-500/50"
          }`}
          onClick={() => setTierFilter(tierFilter === "60d" ? "all" : "60d")}
        >
          <span className="text-[11px] text-muted-foreground uppercase font-bold">&lt; 60 Days (Urgent)</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{urgent60dCount} Contracts</p>
          <span className="text-[10px] text-amber-600 font-medium">Quotation stage</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Under Active Renewal</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{underRenewalCount} Contracts</p>
          <span className="text-[10px] text-cyan-600 font-medium">Pending vendor signature</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active AMC Coverage</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {assets.filter((a) => a.amcCmcContract === "Active").length} Covered
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Valid warranty/CMC</span>
        </Card>
      </div>

      {/* Warranty Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Contract &amp; Warranty Roster</CardTitle>
          <CardDescription className="text-xs">
            Review equipment coverage, vendor agreements, and extend active maintenance contracts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search machine, vendor, serial #..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={contractFilter} onValueChange={setContractFilter}>
                <SelectTrigger className="w-[170px] text-xs h-9">
                  <SelectValue placeholder="Contract Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contract Statuses</SelectItem>
                  <SelectItem value="Active">Active (Covered)</SelectItem>
                  <SelectItem value="Under Renewal">Under Renewal</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Asset Code</TableHead>
                  <TableHead className="text-xs font-bold">Equipment &amp; Model</TableHead>
                  <TableHead className="text-xs font-bold">OEM Vendor / Partner</TableHead>
                  <TableHead className="text-xs font-bold">Purchase Date</TableHead>
                  <TableHead className="text-xs font-bold">Warranty / AMC Expiry</TableHead>
                  <TableHead className="text-xs font-bold">Contract Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const days = getDaysToExpiry(asset.warrantyExpiry);
                  const isExpiringSoon = days <= 60;

                  return (
                    <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {asset.assetCode}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{asset.name}</div>
                        <div className="text-[10px] text-muted-foreground">{asset.department} • SN: {asset.serialNo}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium text-foreground">{asset.vendorName}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {asset.purchaseDate}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">
                        <span className={isExpiringSoon ? "text-rose-600 font-bold" : "text-foreground"}>
                          {asset.warrantyExpiry}
                        </span>
                        {isExpiringSoon && (
                          <span className="text-[9px] text-rose-600 block">
                            ({days <= 0 ? "Expired" : `${days} days remaining`})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            asset.amcCmcContract === "Active"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                              : asset.amcCmcContract === "Under Renewal"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                          }
                        >
                          {asset.amcCmcContract}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs font-semibold px-2"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setHistoryDrawerOpen(true);
                            }}
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold px-2 text-primary border-primary/30"
                            onClick={() => openRenew(asset)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Renew AMC
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Renew AMC Modal */}
      <Dialog open={renewModalOpen} onOpenChange={setRenewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleRenewSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" /> Renew AMC / CMC Maintenance Contract
              </DialogTitle>
              <DialogDescription className="text-xs">
                Extend OEM warranty agreement for <strong>{selectedAsset?.name} [{selectedAsset?.assetCode}]</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">OEM Vendor:</span>
                  <span className="font-semibold text-foreground">{selectedAsset?.vendorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Expiry:</span>
                  <span className="font-mono text-muted-foreground">{selectedAsset?.warrantyExpiry}</span>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ren-date">Extended Warranty / AMC Expiry Date *</Label>
                <Input
                  id="ren-date"
                  type="date"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ren-cost">Annual Contract Fee (₹) *</Label>
                <Input
                  id="ren-cost"
                  type="number"
                  required
                  value={renewCost}
                  onChange={(e) => setRenewCost(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ren-auth">Authorized By *</Label>
                <Input
                  id="ren-auth"
                  required
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRenewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Certify Renewal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AssetHistoryDrawer
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
        asset={selectedAsset}
        historyEvents={historyEvents}
      />
    </div>
  );
}
