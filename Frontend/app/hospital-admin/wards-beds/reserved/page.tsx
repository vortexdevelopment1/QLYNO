"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  AlertTriangle,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Timer,
  XCircle,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { WardsBedsNav } from "@/hospital-admin/components/wards-beds/wards-beds-nav";
import { cancelReservation } from "@/hospital-admin/store/slices/wardsBedsSlice";
import { Bed } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function ReservedBedsPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { beds } = useSelector((state: RootState) => state.wardsBeds);

  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const reservedBeds = useMemo(() => {
    return beds.filter((b) => {
      const isRes = b.status === "Reserved";
      const matchesSearch =
        b.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.wardName.toLowerCase().includes(search.toLowerCase()) ||
        (b.reservedForPatientName && b.reservedForPatientName.toLowerCase().includes(search.toLowerCase()));
      return isRes && matchesSearch;
    });
  }, [beds, search]);

  const handleCancelReservation = (bedId: string, bedNumber: string) => {
    dispatch(cancelReservation(bedId));
    toast({
      title: "Reservation Cancelled",
      description: `${bedNumber} released back to Available status.`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Reserved Inpatient Beds"
          description="Pre-allocated beds for planned surgical post-op recovery and scheduled admissions."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Reserved Beds" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading reserved beds...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Reserved Inpatient Beds"
        description="Pre-allocated beds for planned surgical post-op recovery and scheduled admissions."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Reserved Beds" }]}
      />

      <WardsBedsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Currently Reserved</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{reservedBeds.length} Beds</p>
          <span className="text-[10px] text-amber-600 font-medium">Held for scheduled intake</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Auto-Release Rule</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Enforced</p>
          <span className="text-[10px] text-emerald-600 font-medium">Reverts to Available at expiry</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Surgical PACU Holds</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">1 Case</p>
          <span className="text-[10px] text-primary font-medium">Synced with OT Cases</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Reservation Lead Time</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">&lt; 12 Hours</p>
          <span className="text-[10px] text-cyan-600 font-medium">Max holding window</span>
        </Card>
      </div>

      {/* Reserved Beds Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Pre-Allocated Bed Reservations</CardTitle>
          <CardDescription className="text-xs">
            Beds held for impending admissions with automated expiry release gates.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bed number, ward, or patient..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Bed #</TableHead>
                  <TableHead className="text-xs font-bold">Ward Unit &amp; Floor</TableHead>
                  <TableHead className="text-xs font-bold">Held For Patient / Clinical Case</TableHead>
                  <TableHead className="text-xs font-bold">Reservation Expiry Window</TableHead>
                  <TableHead className="text-xs font-bold">Auto-Release Rule</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservedBeds.map((bed) => (
                  <TableRow key={bed.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-amber-600">
                      {bed.bedNumber}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">{bed.wardName}</div>
                      <div className="text-[10px] text-muted-foreground">{bed.floor} • {bed.tier}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {bed.reservedForPatientName || "Scheduled Surgery Patient"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-600 font-semibold">
                      {bed.reservedExpiry ? new Date(bed.reservedExpiry).toLocaleString() : "Today, 18:00"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                        <Timer className="h-3 w-3 mr-1" /> Auto-Release Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancelReservation(bed.id, bed.bedNumber)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Release Hold
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
