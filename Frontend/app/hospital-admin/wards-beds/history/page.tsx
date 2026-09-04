"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { formatDateTime } from "@/hospital-admin/lib/utils";
import { WardsBedsNav } from "@/hospital-admin/components/wards-beds/wards-beds-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function BedHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const { history } = useSelector((state: RootState) => state.wardsBeds);
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchesSearch =
        h.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
        h.wardName.toLowerCase().includes(search.toLowerCase()) ||
        (h.patientName && h.patientName.toLowerCase().includes(search.toLowerCase())) ||
        h.staffName.toLowerCase().includes(search.toLowerCase()) ||
        h.details.toLowerCase().includes(search.toLowerCase());
      const matchesEvent = eventFilter === "all" || h.eventType === eventFilter;
      return matchesSearch && matchesEvent;
    });
  }, [history, search, eventFilter]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Timestamp,Bed Number,Ward,Event Type,Patient,Staff,Details\n" +
      history
        .map(
          (h) =>
            `${h.id},"${h.timestamp}","${h.bedNumber}","${h.wardName}","${h.eventType}","${h.patientName || ""}","${h.staffName}","${h.details}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bed_History_Audit_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Audit CSV Downloaded",
      description: "Bed occupancy and event history exported successfully.",
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Bed History &amp; Event Audit Log"
          description="Append-only audit trail of every allocation, inter-ward transfer, discharge, and sanitization cycle."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Bed History" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading history audit trail...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Bed History &amp; Event Audit Log"
        description="Append-only audit trail of every allocation, inter-ward transfer, discharge, and sanitization cycle."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Bed History" }]}
        actions={
          <Button size="sm" variant="outline" className="gap-1.5 font-semibold text-xs" onClick={handleExportCSV}>
            <Download className="h-4 w-4" /> Export Audit CSV
          </Button>
        }
      />

      <WardsBedsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Logged Events</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{history.length} Events</p>
          <span className="text-[10px] text-primary font-medium">Append-only audit register</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Immutable Trail</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Audited</p>
          <span className="text-[10px] text-emerald-600 font-medium">Zero retrospective tampering</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">IPD Billing Calculation</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">Accrued</p>
          <span className="text-[10px] text-cyan-600 font-medium">Computes bed-day tariff charges</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Audit Export</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">CSV / Excel</p>
          <span className="text-[10px] text-amber-600 font-medium">NABH hospital accreditation ready</span>
        </Card>
      </div>

      {/* Bed History Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Hospital-Wide Bed Event Audit Register</CardTitle>
          <CardDescription className="text-xs">
            Chronological audit log tracking bed occupancy timelines, patient transfers, and disinfection sign-offs.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bed, patient, staff, or details..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="Allocation">Allocation</SelectItem>
                  <SelectItem value="Discharge">Discharge / Vacate</SelectItem>
                  <SelectItem value="Transfer Out">Transfer Out</SelectItem>
                  <SelectItem value="Transfer In">Transfer In</SelectItem>
                  <SelectItem value="Cleaning Completed">Cleaning Completed</SelectItem>
                  <SelectItem value="Reservation">Reservation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Timestamp</TableHead>
                  <TableHead className="text-xs font-bold">Bed Number</TableHead>
                  <TableHead className="text-xs font-bold">Ward Unit</TableHead>
                  <TableHead className="text-xs font-bold">Event Type</TableHead>
                  <TableHead className="text-xs font-bold">Patient Involved</TableHead>
                  <TableHead className="text-xs font-bold">Authorizing Staff</TableHead>
                  <TableHead className="text-xs font-bold">Audit Event Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                      {formatDateTime(entry.timestamp)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {entry.bedNumber}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{entry.wardName}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          entry.eventType === "Allocation"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                            : entry.eventType === "Discharge"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : entry.eventType === "Cleaning Completed"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                        }
                      >
                        {entry.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">
                      {entry.patientName || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.staffName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[320px]">
                      {entry.details}
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
