"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  History,
  Layers,
  Search,
  Stethoscope,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { SurgeryHistoryRecord } from "@/hospital-admin/store/slices/surgicalSlice";
import { cn } from "@/hospital-admin/lib/utils";

export default function SurgeryHistoryPage() {
  const { toast } = useToast();
  const { history } = useSelector((state: RootState) => state.surgical);

  const [searchTerm, setSearchTerm] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState<SurgeryHistoryRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const filteredHistory = history.filter((rec) => {
    const matchesSearch =
      rec.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.surgeonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.procedureType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOutcome = outcomeFilter === "ALL" || rec.outcome === outcomeFilter;
    const matchesDept = deptFilter === "ALL" || rec.department === deptFilter;
    return matchesSearch && matchesOutcome && matchesDept;
  });

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      toast({ title: "No Records to Export", description: "Filter criteria returned 0 rows.", variant: "destructive" });
      return;
    }

    const headers = "Case ID,Patient Name,Patient ID,Procedure,Department,Surgeon,Room,Date,Duration (Mins),Outcome,Post-Op Summary\n";
    const rows = filteredHistory
      .map(
        (r) =>
          `"${r.caseId}","${r.patientName}","${r.patientId}","${r.procedureType}","${r.department}","${r.surgeonName}","${r.roomName}","${r.date}","${r.durationMins}","${r.outcome}","${r.postOpSummary.replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `surgery_history_register_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Surgery Register Exported",
      description: `${filteredHistory.length} historical surgery records exported to CSV.`,
    });
  };

  const handleOpenDetail = (rec: SurgeryHistoryRecord) => {
    setSelectedRecord(rec);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Surgery History &amp; Audit Archive"
        description="Immutable historical log of completed and cancelled surgical operations with outcome telemetry."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Surgery History" }]}
        actions={
          <Button size="sm" variant="outline" className="gap-1.5 font-semibold text-xs" onClick={handleExportCSV}>
            <Download className="h-4 w-4 text-primary" /> Export Surgery Register
          </Button>
        }
      />

      <SurgicalNav />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Archive</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{history.length} Cases</p>
          <span className="text-[10px] text-muted-foreground">Historical records</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Successful Outcomes</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {history.filter((r) => r.outcome === "Successful").length} Cases
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">98.4% Success rate</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Complications Logged</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {history.filter((r) => r.outcome === "Completed with Complications").length} Cases
          </p>
          <span className="text-[10px] text-amber-600 font-medium">M&amp;M Audit Reviewed</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Cancelled Pre-Op</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {history.filter((r) => r.outcome === "Cancelled").length} Cases
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Medical/elective deferrals</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patient, surgeon, procedure or case ID..."
            className="pl-8 h-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="h-9 text-xs w-[140px]">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Outcomes</SelectItem>
              <SelectItem value="Successful">Successful</SelectItem>
              <SelectItem value="Completed with Complications">Complications</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-9 text-xs w-[150px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Specialties</SelectItem>
              <SelectItem value="General Surgery">General Surgery</SelectItem>
              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
              <SelectItem value="Neurology">Neurology</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* History Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Historical Surgical Register</CardTitle>
          <CardDescription className="text-xs">
            Permanent archive of all discharged operative cases with surgical duration and outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Lead Surgeon</TableHead>
                <TableHead>Operating Suite</TableHead>
                <TableHead>Date &amp; Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="text-right">Audit Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-mono text-xs font-bold text-primary">{rec.caseId}</TableCell>
                  <TableCell>
                    <div>
                      <strong className="text-xs font-bold text-foreground">{rec.patientName}</strong>
                      <span className="text-[10px] font-mono text-muted-foreground block">{rec.patientId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <p className="font-medium text-foreground">{rec.procedureType}</p>
                    <span className="text-[10px] text-muted-foreground">{rec.department}</span>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">{rec.surgeonName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{rec.roomName}</TableCell>
                  <TableCell className="text-xs">
                    <span className="font-mono text-foreground block">{rec.date}</span>
                    <span className="text-[10px] text-muted-foreground">{rec.durationMins} mins duration</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rec.outcome === "Successful"
                          ? "success"
                          : rec.outcome === "Cancelled"
                          ? "destructive"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {rec.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-primary"
                      onClick={() => handleOpenDetail(rec)}
                    >
                      <Eye className="h-3.5 w-3.5" /> View Log
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                    No historical surgery records matching current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL: HISTORICAL AUDIT DETAIL (READ ONLY)                                */}
      {/* ========================================================================= */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Surgical Audit Record — {selectedRecord?.caseId}
            </DialogTitle>
            <DialogDescription>
              Archived historical clinical telemetry (Immutable audit record).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-foreground text-sm">{selectedRecord?.patientName}</strong>
                <Badge variant="outline" className="font-mono text-[10px]">{selectedRecord?.patientId}</Badge>
              </div>
              <p className="text-primary font-semibold">{selectedRecord?.procedureType}</p>
              <p className="text-muted-foreground">{selectedRecord?.department} • {selectedRecord?.roomName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded bg-muted/20 border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Lead Operating Surgeon:</span>
                <strong className="text-foreground">{selectedRecord?.surgeonName}</strong>
              </div>
              <div className="p-2.5 rounded bg-muted/20 border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Operative Duration:</span>
                <strong className="text-foreground">{selectedRecord?.durationMins} minutes</strong>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded bg-muted/20 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Operative Team:</span>
              <div className="flex flex-wrap gap-1">
                {selectedRecord?.team.map((m, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-background border font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded bg-muted/20 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Post-Operative Course Summary:</span>
              <p className="text-foreground leading-relaxed text-[11px]">{selectedRecord?.postOpSummary}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setDetailModalOpen(false)}>Close Audit Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
