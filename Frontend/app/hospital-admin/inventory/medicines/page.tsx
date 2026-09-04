"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Pill,
  ExternalLink,
  Search,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Boxes,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InventoryNav } from "@/hospital-admin/components/inventory/inventory-nav";
import { mockMedicineInventory } from "@/hospital-admin/lib/mock-data/section12-operations";

export default function InventoryMedicinesPage() {
  const [search, setSearch] = useState("");

  const medicines = mockMedicineInventory;

  const lowStockMeds = useMemo(
    () => medicines.filter((m) => m.stockLevel <= m.minThreshold),
    [medicines]
  );

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const match =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.genericName.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(search.toLowerCase());
      return match;
    });
  }, [medicines, search]);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Medicines & Pharmaceutical Inventory"
        description="Cross-module synchronization with Pharmacy department. View active drug formulations, formulations, and batch dispensing."
        crumbs={[{ label: "Supply & Assets" }, { label: "Inventory" }, { label: "Medicines" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="gap-1.5 font-semibold text-xs">
              <Link href="/hospital-admin/pharmacy">
                <ExternalLink className="h-4 w-4" /> Open Full Pharmacy Module
              </Link>
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation */}
      <InventoryNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Stores • Pharmacy Cross-Reference Hub" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Single Source of Truth: Data synchronized live from Pharmacy Department</span>
        </div>
      </div>

      {/* Governance Banner (Rule F19-CANNOT-1) */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground">Pharmaceutical Governance Notice</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Per Hospital Standard Operating Procedures (Rule F19-CANNOT-1), pharmaceutical drugs and clinical formulations are managed by the Pharmacy department. This view provides real-time cross-functional visibility into stock levels without duplicating the master drug registry.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold">
            <Link href="/hospital-admin/pharmacy/low-stock">
              <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-600" /> Pharmacy Low Stock ({lowStockMeds.length})
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold">
            <Link href="/hospital-admin/pharmacy/expiry">
              <Clock className="h-3.5 w-3.5 mr-1 text-cyan-600" /> Batch Expiry Tracker
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold">
            <Link href="/hospital-admin/pharmacy/dispensing">
              <Boxes className="h-3.5 w-3.5 mr-1 text-emerald-600" /> OPD/IPD Dispensing Log
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Cataloged Medicines</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{medicines.length} Formulations</p>
          <span className="text-[10px] text-muted-foreground">Active in hospital formulary</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Low Stock Medicines</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{lowStockMeds.length} Items</p>
          <span className="text-[10px] text-amber-600 font-medium">Reorders managed in Pharmacy</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Dispensing Channels</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">3 Counters</p>
          <span className="text-[10px] text-cyan-600 font-medium">OPD, IPD &amp; Emergency</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Sync Status</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Active Live</p>
          <span className="text-[10px] text-emerald-600 font-medium">Real-time store ledger link</span>
        </Card>
      </div>

      {/* Directory Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold">Active Pharmaceutical Formulary (Read-Only Preview)</CardTitle>
            <CardDescription className="text-xs">
              Live snapshot of drug formulations, dosage strengths, and current warehouse/rack balances.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drug name, generic salt, batch..."
              className="pl-8 text-xs h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Brand Name</TableHead>
                  <TableHead className="text-xs font-bold">Generic Salt Composition</TableHead>
                  <TableHead className="text-xs font-bold">Dosage &amp; Form</TableHead>
                  <TableHead className="text-xs font-bold">Batch #</TableHead>
                  <TableHead className="text-xs font-bold">Stock In Hand</TableHead>
                  <TableHead className="text-xs font-bold">Rack Location</TableHead>
                  <TableHead className="text-xs font-bold">Batch Expiry</TableHead>
                  <TableHead className="text-xs font-bold">Unit Price</TableHead>
                  <TableHead className="text-xs font-bold text-right">Pharmacy Handoff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((med) => (
                  <TableRow key={med.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Pill className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{med.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {med.genericName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {med.dosageForm}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">
                      {med.batchNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold">
                      <span className={med.stockLevel <= med.minThreshold ? "text-amber-600 font-bold" : "text-emerald-600"}>
                        {med.stockLevel} {med.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {med.rackLocation}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {med.expiryDate}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      ₹{med.unitPrice}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs font-semibold">
                        <Link href="/hospital-admin/pharmacy">
                          Manage in Pharmacy <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
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
