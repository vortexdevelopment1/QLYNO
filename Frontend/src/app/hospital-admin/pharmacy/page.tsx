"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  User,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PharmacyNav } from "@/hospital-admin/components/pharmacy/pharmacy-nav";
import {
  mockMedicineInventory,
  mockDispensingLogs,
  mockPharmacyAlerts,
} from "@/hospital-admin/lib/mock-data/section12-operations";
import { MedicineItem, DispensingRecord, PharmacyAlert } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacyPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("inventory");
  const [medicines, setMedicines] = useState<MedicineItem[]>(mockMedicineInventory);
  const [dispensingLogs] = useState<DispensingRecord[]>(mockDispensingLogs);
  const [alerts] = useState<PharmacyAlert[]>(mockPharmacyAlerts);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Medicine Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [medName, setMedName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [category, setCategory] = useState<any>("Antibiotics");
  const [dosageForm, setDosageForm] = useState<any>("Tablet");
  const [stockLevel, setStockLevel] = useState(100);
  const [minThreshold, setMinThreshold] = useState(30);
  const [rackLocation, setRackLocation] = useState("Rack A-01");
  const [unitPrice, setUnitPrice] = useState(150);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.genericName.toLowerCase().includes(search.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        m.rackLocation.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === "all" || m.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [medicines, search, categoryFilter, statusFilter]);

  const zeroStockCritical = useMemo(
    () => medicines.filter((m) => m.stockLevel === 0 && m.category === "Critical Emergency"),
    [medicines]
  );

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const newMed: MedicineItem = {
      id: `MED-0${medicines.length + 1}`,
      name: medName,
      genericName: genericName || medName,
      category,
      dosageForm,
      stockLevel: Number(stockLevel),
      unitPrice: Number(unitPrice),
      batchNumber: `BAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: "2027-06-30",
      manufacturer: "Cadila Healthcare Ltd",
      rackLocation,
      minThreshold: Number(minThreshold),
      status: Number(stockLevel) <= Number(minThreshold) ? "Low Stock" : "In Stock",
    };

    setMedicines((prev) => [newMed, ...prev]);
    toast({
      title: "Medicine Added to Formulary",
      description: `${medName} (${category}) added with stock level ${stockLevel}. (${DELEGATION_STRING})`,
    });
    setAddModalOpen(false);
    setMedName("");
    setGenericName("");
  };

  const handleRestockQuick = (medId: string, qty: number) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
          const newLevel = m.stockLevel + qty;
          return {
            ...m,
            stockLevel: newLevel,
            status: newLevel <= m.minThreshold ? "Low Stock" : "In Stock",
          };
        }
        return m;
      })
    );
    toast({
      title: "Stock Replenished",
      description: `Added ${qty} units to stock. Single source of truth inventory updated. (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Pharmacy &amp; Formulary Operations"
          description="Real-time medication formulary inventory, automated reorder thresholds, and FEFO stock dispatch."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading pharmacy console...
        </div>
      </div>
    );
  }

  const lowStockCount = medicines.filter((m) => m.status === "Low Stock" || m.status === "Out of Stock").length;
  const expiringCount = medicines.filter((m) => m.status === "Expiring Soon").length;
  const totalSKUs = medicines.length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Pharmacy &amp; Formulary Operations"
        description="Real-time medication formulary inventory, automated reorder thresholds, and FEFO stock dispatch."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/hospital-admin/procurement/create">
              <Button size="sm" variant="outline" className="gap-1.5 font-semibold text-xs text-primary border-primary/30 hover:bg-primary/10">
                <ShoppingCart className="h-4 w-4" /> Create Purchase Order
              </Button>
            </Link>
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add Medicine
            </Button>
          </div>
        }
      />

      {/* Unified Pharmacy Sub-Navigation */}
      <PharmacyNav />

      {/* Scope Indicator & Governance Rule */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Inpatient &amp; OPD Dispensary" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Dispensary Governance • Administration manages operational inventory; dispensing &amp; Schedule H1 verified by licensed pharmacists</span>
        </div>
      </div>

      {/* Emergency Zero Stock Alert Banner */}
      {zeroStockCritical.length > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/10 shadow-xs">
          <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-300">
                  CRITICAL EMERGENCY ALERT: {zeroStockCritical.length} Life-Saving SKU(s) at Zero Stock
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {zeroStockCritical.map((m) => m.name).join(", ")} — Immediate emergency procurement required for ICU &amp; Emergency OT.
                </p>
              </div>
            </div>
            <Link href="/hospital-admin/procurement/create">
              <Button size="sm" variant="destructive" className="text-xs font-semibold shrink-0">
                Create Emergency PO
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Formularies</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalSKUs} SKUs</p>
          <span className="text-[10px] text-emerald-600 font-medium">All active hospital batches</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Low / Out of Stock</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{lowStockCount} SKUs</p>
          <span className="text-[10px] text-rose-600 font-medium">Below safety threshold</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Expiring &lt;30 Days</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{expiringCount} Batches</p>
          <span className="text-[10px] text-amber-600 font-medium">FEFO dispatch prioritized</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Today's Dispensing</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">148 Prescriptions</p>
          <span className="text-[10px] text-muted-foreground">Accrued to Pharmacy Billing</span>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="inventory" className="text-xs">Medicine Inventory</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">Stock Alerts Panel</TabsTrigger>
          <TabsTrigger value="dispensing" className="text-xs">Dispensing Activity</TabsTrigger>
        </TabsList>

        {/* TAB 1: MEDICINE INVENTORY */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold">Formulary &amp; Stock Registry</CardTitle>
                  <CardDescription className="text-xs">
                    Single source of truth inventory with real-time stock levels, batch numbers, and reorder thresholds.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search medicine or batch..."
                      className="pl-8 text-xs h-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px] text-xs h-8">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Critical Emergency">Critical Emergency</SelectItem>
                      <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                      <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                      <SelectItem value="Analgesics">Analgesics</SelectItem>
                      <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] text-xs h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
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
                      <TableHead className="text-xs font-bold w-[220px]">Medicine / Generic Name</TableHead>
                      <TableHead className="text-xs font-bold w-[140px]">Category &amp; Form</TableHead>
                      <TableHead className="text-xs font-bold w-[120px]">Batch &amp; Expiry</TableHead>
                      <TableHead className="text-xs font-bold w-[110px]">Location</TableHead>
                      <TableHead className="text-xs font-bold w-[100px]">Unit Price</TableHead>
                      <TableHead className="text-xs font-bold w-[110px]">Current Stock</TableHead>
                      <TableHead className="text-xs font-bold w-[110px]">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[110px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedicines.map((m) => (
                      <TableRow key={m.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{m.name}</div>
                          <div className="text-[10px] text-muted-foreground italic">{m.genericName}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-foreground">{m.category}</div>
                          <div className="text-[10px] text-muted-foreground">{m.dosageForm}</div>
                        </TableCell>

                        <TableCell className="font-mono text-xs text-muted-foreground">
                          <div>{m.batchNumber}</div>
                          <div className="text-[10px]">{m.expiryDate}</div>
                        </TableCell>

                        <TableCell className="font-mono text-xs text-foreground">
                          {m.rackLocation}
                        </TableCell>

                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                          ₹{m.unitPrice}
                        </TableCell>

                        <TableCell>
                          <div className="font-mono text-xs font-bold text-foreground">
                            {m.stockLevel} units
                          </div>
                          <div className="text-[9px] text-muted-foreground">Min: {m.minThreshold}</div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              m.status === "In Stock"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                                : m.status === "Low Stock"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                                : m.status === "Out of Stock"
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                                : "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px]"
                            }
                          >
                            {m.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                            onClick={() => handleRestockQuick(m.id, 50)}
                          >
                            + Restock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: STOCK ALERTS PANEL */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((a) => (
              <Card key={a.id} className="border-border shadow-xs">
                <CardHeader className="p-3.5 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          a.severity === "Critical" ? "text-rose-600" : "text-amber-600"
                        }`}
                      />
                      <span>{a.medicineName}</span>
                    </CardTitle>
                    <Badge
                      className={
                        a.severity === "Critical"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px]"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]"
                      }
                    >
                      {a.alertType || a.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 pt-0 space-y-2 text-xs">
                  <p className="text-muted-foreground">{a.message || a.actionRequired}</p>
                  <div className="flex items-center justify-between font-mono text-[11px] pt-1">
                    <span>Stock: <strong>{a.currentStock}</strong> / Min: {a.minThreshold || a.thresholdOrExpiry}</span>
                    <span className="text-muted-foreground">Expires: {a.expiryDate || a.thresholdOrExpiry}</span>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link href="/hospital-admin/procurement/create">
                      <Button size="sm" className="h-7 text-xs font-semibold bg-primary text-primary-foreground">
                        Create Reorder PO
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: DISPENSING ACTIVITY */}
        <TabsContent value="dispensing" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Dispensing Audit Trail</CardTitle>
              <CardDescription className="text-xs">
                Audit record of fulfilled prescriptions linked directly to patient ledger and nurse administration logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[140px]">Prescription #</TableHead>
                      <TableHead className="text-xs font-bold w-[180px]">Patient &amp; MRN</TableHead>
                      <TableHead className="text-xs font-bold w-[160px]">Prescribing Doctor</TableHead>
                      <TableHead className="text-xs font-bold w-[220px]">Dispensed Items</TableHead>
                      <TableHead className="text-xs font-bold w-[140px]">Pharmacist</TableHead>
                      <TableHead className="text-xs font-bold w-[120px]">Timestamp</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[100px]">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispensingLogs.map((d) => (
                      <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {d.prescriptionNumber || d.prescriptionNo}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{d.patientName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{d.patientId}</div>
                        </TableCell>

                        <TableCell className="text-xs text-foreground">
                          {d.doctorName}
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-foreground">
                            {d.items.map((i) => `${i.medicineName} (${i.quantity}x)`).join(", ")}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {d.pharmacistName}
                        </TableCell>

                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {d.timestamp || d.dispensedAt}
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                          ₹{d.totalAmount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: ADD MEDICINE */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddMedicine}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" /> Register New Medicine Formulary
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add a new pharmaceutical SKU to the hospital master formulary.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="m-name">Brand Name *</Label>
                <Input
                  id="m-name"
                  required
                  placeholder="e.g. Augmentin 625mg Duo"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="m-gen">Generic Composition</Label>
                <Input
                  id="m-gen"
                  placeholder="e.g. Amoxicillin 500mg + Clavulanic Acid 125mg"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="m-cat">Therapeutic Category</Label>
                  <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                    <SelectTrigger id="m-cat" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                      <SelectItem value="Critical Emergency">Critical Emergency</SelectItem>
                      <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                      <SelectItem value="Analgesics">Analgesics</SelectItem>
                      <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="m-form">Dosage Form</Label>
                  <Select value={dosageForm} onValueChange={(val: any) => setDosageForm(val)}>
                    <SelectTrigger id="m-form" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Capsule">Capsule</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                      <SelectItem value="Syrup">Syrup</SelectItem>
                      <SelectItem value="IV Infusion">IV Infusion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="m-stock">Initial Stock</Label>
                  <Input
                    id="m-stock"
                    type="number"
                    value={stockLevel}
                    onChange={(e) => setStockLevel(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="m-min">Min Alert Threshold</Label>
                  <Input
                    id="m-min"
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="m-price">Unit Price (₹)</Label>
                  <Input
                    id="m-price"
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="m-rack">Storage Rack / Shelf Location</Label>
                <Input
                  id="m-rack"
                  value={rackLocation}
                  onChange={(e) => setRackLocation(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Register Medicine
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
