"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PharmacyNav } from "@/hospital-admin/components/pharmacy/pharmacy-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockPharmacySuppliers } from "@/hospital-admin/lib/mock-data/pharmacy-extended-operations";
import { PharmacySupplier } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacySuppliersPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [suppliers] = useState<PharmacySupplier[]>(mockPharmacySuppliers);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.categoriesSupplied.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
      s.address.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Licensed Pharmaceutical Suppliers Directory"
          description="Pharmacy-filtered vendor registry with lead-time tracking, reliability ratings, and procurement linkages."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Suppliers" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading suppliers directory...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Licensed Pharmaceutical Suppliers Directory"
        description="Pharmacy-filtered vendor registry with lead-time tracking, reliability ratings, and procurement linkages."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Suppliers" }]}
        actions={
          <Link href="/hospital-admin/procurement/vendors">
            <Button size="sm" variant="outline" className="gap-1.5 font-semibold text-xs text-primary border-primary/30 hover:bg-primary/10">
              <Building2 className="h-4 w-4" /> Hospital Vendor Master
            </Button>
          </Link>
        }
      />

      <PharmacyNav />

      {/* Scope Indicator & Registry Architecture */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Pharmaceutical Vendor Governance" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Truck className="h-3.5 w-3.5 text-primary" />
          <span>Integration: Reads directly from hospital-wide vendor registry — no separate supplier silo</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Distributors</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{suppliers.length} Verified</p>
          <span className="text-[10px] text-emerald-600 font-medium">Licensed pharma wholesalers</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Delivery Lead Time</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">2.5 Days</p>
          <span className="text-[10px] text-primary font-medium">Rapid replenishment window</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Reliability Rating</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">96.5%</p>
          <span className="text-[10px] text-emerald-600 font-medium">On-time &amp; intact shipments</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active PO Commitments</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">
            {suppliers.reduce((acc, s) => acc + s.activePOCount, 0)} In Flight
          </p>
          <span className="text-[10px] text-muted-foreground">Orders across all vendors</span>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Pharmaceutical Distributor Registry</CardTitle>
              <CardDescription className="text-xs">
                Verified wholesale suppliers providing antibiotics, critical ICU injections, cold-chain biologicals, and IV fluids.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search vendor or category..."
                className="pl-8 text-xs h-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[220px]">Supplier Name &amp; Address</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Contact Person</TableHead>
                  <TableHead className="text-xs font-bold w-[240px]">Supplied Categories</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Lead Time</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Reliability Score</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Active POs</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[200px]">{s.address}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{s.contactPerson}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.phone}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.categoriesSupplied.map((cat, idx) => (
                          <Badge key={idx} variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {s.leadTimeDays} {s.leadTimeDays === 1 ? "Day" : "Days"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-600">
                        <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                        <span>{s.reliabilityScore}%</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {s.activePOCount} Active
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href="/hospital-admin/procurement/create">
                        <Button size="sm" variant="outline" className="h-7 text-xs font-semibold text-primary hover:bg-primary/10">
                          Reorder PO
                        </Button>
                      </Link>
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
