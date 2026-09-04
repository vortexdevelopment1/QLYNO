"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  ShieldAlert,
  FileSpreadsheet,
  FileText,
  Filter,
  BarChart3,
  TrendingUp,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Activity,
  Bed,
  Sparkles,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Progress } from "@/hospital-admin/components/ui/progress";
import { Avatar, AvatarFallback } from "@/hospital-admin/components/ui/avatar";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { jsPDF } from "jspdf";

export function StationReportsView() {
  const { toast } = useToast();
  const {
    currentRole,
    stations,
    nurses,
    supportStaff,
    tasks,
    roster,
    handovers,
    escalations,
    doctorInstructions,
    activeStationId,
  } = useSelector((state: RootState) => state.nursingOperations);

  const [selectedStationId, setSelectedStationId] = useState<string>(activeStationId || "st-1");
  const [activeSubSection, setActiveSubSection] = useState<"staffing" | "attendance" | "workload" | "tasks" | "shifts" | "escalations">("staffing");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (activeStationId && currentRole !== "admin") {
      setSelectedStationId(activeStationId);
    }
  }, [activeStationId, currentRole]);

  const currentStation = stations.find((s) => s.station_id === selectedStationId) || stations[0] || {
    station_id: "st-1",
    name: "ICU & Critical Care Station",
    department_name: "Intensive Care Unit",
    location_name: "Main Campus - Block A, Floor 2",
    lead_name: "Sister Anita Joseph",
    totalBeds: 14,
  };

  const stationNurses = useMemo(() => nurses.filter((n) => n.station_id === selectedStationId), [nurses, selectedStationId]);
  const stationSupport = useMemo(() => supportStaff.filter((s) => s.station_id === selectedStationId), [supportStaff, selectedStationId]);
  const stationTasks = useMemo(() => tasks.filter((t) => t.station_id === selectedStationId), [tasks, selectedStationId]);
  const stationEscalations = useMemo(() => escalations.filter((e) => e.station_id === selectedStationId), [escalations, selectedStationId]);
  const stationRoster = useMemo(() => roster.filter((r) => r.station_id === selectedStationId), [roster, selectedStationId]);

  // Export handlers
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Station Report: " + currentStation.name + "\n" +
      "Sub-section: " + activeSubSection.toUpperCase() + "\n" +
      "Date Range: " + dateRange + "\n" +
      "Generated At: " + new Date().toLocaleString() + "\n\n" +
      "Staff Name,Role,Status,Assigned Patients,Default Shift\n" +
      stationNurses.map(n => `"${n.name}","${n.role}","${n.availability}",${n.assignedPatientsCount},"${n.defaultShiftPattern}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Station_Report_${activeSubSection}_${selectedStationId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Report Downloaded",
      description: `Station report for ${activeSubSection} exported successfully.`,
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Station Report: ${currentStation.name}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Sub-Section: ${activeSubSection.toUpperCase()} | Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Lead: ${currentStation.lead_name || "Unassigned"} | Dept: ${currentStation.department_name}`, 14, 34);

    let y = 46;
    doc.setFontSize(12);
    doc.text("Nurse Staff Roster & Operational Metrics", 14, y);
    y += 8;

    doc.setFontSize(9);
    stationNurses.forEach((n, idx) => {
      doc.text(`${idx + 1}. ${n.name} (${n.role}) — ${n.availability} | Assigned: ${n.assignedPatientsCount} pts`, 14, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Station_Report_${activeSubSection}_${selectedStationId}.pdf`);

    toast({
      title: "PDF Report Generated",
      description: `PDF export for ${activeSubSection} saved successfully.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <BarChart3 className="h-7 w-7 text-primary" />
              Station Reports &amp; Analytics
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
              Nurse Station Scope
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Operational reports and workforce analytics scoped to <strong>{currentStation.name}</strong> (PRD Section 13 &amp; 19).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mounted && currentRole === "admin" ? (
            <Select value={selectedStationId} onValueChange={setSelectedStationId}>
              <SelectTrigger className="h-9 text-xs w-[220px] font-semibold bg-background">
                <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Select Station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((st) => (
                  <SelectItem key={st.station_id} value={st.station_id} className="text-xs">
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card shadow-xs">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <div className="text-left">
                <div className="text-xs font-bold text-foreground truncate max-w-[180px]">{currentStation.name}</div>
                <div className="text-[10px] text-muted-foreground">{currentStation.department_name}</div>
              </div>
            </div>
          )}
          <ScopeIndicator scope={mounted && currentRole === "admin" ? "Hospital Admin" : "Station Lead"} />
        </div>
      </div>

      {/* Sub-Section Navigation Tabs Bar (PRD Section 19 Verbatim) */}
      <div className="rounded-xl border border-border bg-card p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: "staffing", label: "1. Staffing", icon: Users, desc: "Required vs assigned & gaps" },
            { id: "attendance", label: "2. Attendance", icon: UserCheck, desc: "Presence, late & overtime" },
            { id: "workload", label: "3. Workload", icon: Activity, desc: "Patients & task balance" },
            { id: "tasks", label: "4. Tasks", icon: CheckCircle2, desc: "Completion & overdue rate" },
            { id: "shifts", label: "5. Shifts", icon: CalendarClock, desc: "Coverage & handovers" },
            { id: "escalations", label: "6. Escalations", icon: ShieldAlert, desc: "Clinical alerts & doctor coord" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubSection(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Filter className="h-3.5 w-3.5" /> Filter By:
          </div>

          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="h-8 text-xs w-[160px] bg-background">
              <SelectValue placeholder="All Shifts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts (24h)</SelectItem>
              <SelectItem value="Morning">Morning (07:00 – 15:00)</SelectItem>
              <SelectItem value="Evening">Evening (15:00 – 23:00)</SelectItem>
              <SelectItem value="Night">Night (23:00 – 07:00)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="h-8 text-xs w-[140px] bg-background">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today (Live)</SelectItem>
              <SelectItem value="week">Past 7 Days</SelectItem>
              <SelectItem value="month">Past 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="h-8 text-xs gap-1.5 font-semibold">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export CSV
          </Button>
          <Button size="sm" onClick={handleExportPDF} className="h-8 text-xs gap-1.5 font-semibold">
            <FileText className="h-3.5 w-3.5" /> Download PDF Report
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-SECTION 1: STAFFING (PRD Section 13.1)                    */}
      {/* ============================================================ */}
      {activeSubSection === "staffing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Required vs Assigned Staff</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">
                {stationNurses.filter(n => n.availability === "On Duty").length} / {stationNurses.length}
              </p>
              <Progress value={stationNurses.length > 0 ? (stationNurses.filter(n => n.availability === "On Duty").length / stationNurses.length) * 100 : 100} className="h-1.5 mt-2" />
              <p className="text-[11px] text-muted-foreground mt-1">Target coverage: 100%</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Nurse-to-Patient Ratio</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">1 : 2.5</p>
              <Progress value={85} className="h-1.5 mt-2" />
              <p className="text-[11px] text-emerald-600 mt-1">Within optimal ICU standard (1:2 to 1:3)</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Staffing Gaps Deficit</span>
              <p className="text-2xl font-bold font-mono text-rose-600 mt-1">0 Shifts</p>
              <Progress value={0} className="h-1.5 mt-2" />
              <p className="text-[11px] text-emerald-600 mt-1">Zero uncovered shifts today</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Support Staff Allocation</span>
              <p className="text-2xl font-bold font-mono text-purple-600 mt-1">{stationSupport.length} Active</p>
              <Progress value={100} className="h-1.5 mt-2" />
              <p className="text-[11px] text-purple-600 mt-1">Attendants &amp; Housekeeping active</p>
            </Card>
          </div>

          {/* Staffing Allocation Table */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Station Workforce Deployment Table</span>
                <Badge variant="outline" className="text-[10px]">{stationNurses.length} Nurses Assigned</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed role deployment, license registrations, and assigned workload per nurse.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold">Nurse</TableHead>
                    <TableHead className="text-xs font-bold">Role &amp; Grade</TableHead>
                    <TableHead className="text-xs font-bold">Registration / ID</TableHead>
                    <TableHead className="text-xs font-bold">Shift Pattern</TableHead>
                    <TableHead className="text-xs font-bold text-center">Assigned Patients</TableHead>
                    <TableHead className="text-xs font-bold">Duty Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stationNurses.map((n) => (
                    <TableRow key={n.staff_id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border border-border">
                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                              {n.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-foreground">{n.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{n.role}</Badge></TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{n.councilRegistrationId}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{n.defaultShiftPattern}</TableCell>
                      <TableCell className="text-center text-xs font-mono font-bold text-primary">{n.assignedPatientsCount} pts</TableCell>
                      <TableCell>
                        <Badge className={
                          n.availability === "On Duty" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]" :
                          n.availability === "Break" ? "bg-amber-500/15 text-amber-700 text-[10px]" :
                          "bg-muted text-muted-foreground text-[10px]"
                        }>
                          {n.availability}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-SECTION 2: ATTENDANCE (PRD Section 13.2)                  */}
      {/* ============================================================ */}
      {activeSubSection === "attendance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Present &amp; On Duty</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {stationNurses.filter(n => n.availability === "On Duty").length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Live active roster check-in</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">On Scheduled Break</span>
              <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {stationNurses.filter(n => n.availability === "Break").length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">30 min break window active</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">On Approved Leave</span>
              <p className="text-2xl font-bold font-mono text-blue-600 mt-1">
                {stationNurses.filter(n => n.availability === "Leave").length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Planned leave covered</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Overtime / Extended Duty</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">2.5 hrs</p>
              <p className="text-[11px] text-muted-foreground mt-1">Logged across morning shift</p>
            </Card>
          </div>

          {/* Attendance & Punctuality Table */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Shift Attendance &amp; Check-In Log</CardTitle>
              <CardDescription className="text-xs">
                Check-in timestamps, punctuality adherence, and break compliance for station staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold">Staff Member</TableHead>
                    <TableHead className="text-xs font-bold">Staff Type</TableHead>
                    <TableHead className="text-xs font-bold">Shift</TableHead>
                    <TableHead className="text-xs font-bold">Check-In Time</TableHead>
                    <TableHead className="text-xs font-bold">Punctuality Status</TableHead>
                    <TableHead className="text-xs font-bold text-right">Overtime Logged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stationNurses.map((n, i) => (
                    <TableRow key={n.staff_id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs text-foreground">{n.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{n.role}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">Morning (07:00 – 15:00)</TableCell>
                      <TableCell className="text-xs font-mono">{i === 0 ? "06:52 AM" : i === 1 ? "06:58 AM" : "07:04 AM"}</TableCell>
                      <TableCell>
                        <Badge className={i < 2 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]" : "bg-cyan-500/15 text-cyan-700 text-[10px]"}>
                          {i < 2 ? "On Time" : "Grace Period (+4m)"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">{i === 0 ? "1.5h" : "0.0h"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-SECTION 3: WORKLOAD (PRD Section 13.3)                    */}
      {/* ============================================================ */}
      {activeSubSection === "workload" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Active Inpatients</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">4 Patients</p>
              <p className="text-[11px] text-muted-foreground mt-1">14 Station Total Beds</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Active Care Tasks</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{stationTasks.length} Tasks</p>
              <p className="text-[11px] text-emerald-600 mt-1">{stationTasks.filter(t => t.status === "Completed").length} completed today</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">High-Acuity Cases</span>
              <p className="text-2xl font-bold font-mono text-rose-600 mt-1">2 Critical</p>
              <p className="text-[11px] text-rose-600 mt-1">Bed 02 &amp; Bed 06 ICU</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Avg Tasks / Nurse</span>
              <p className="text-2xl font-bold font-mono text-cyan-600 mt-1">
                {stationNurses.length > 0 ? (stationTasks.length / stationNurses.length).toFixed(1) : 0}
              </p>
              <p className="text-[11px] text-cyan-600 mt-1">Evenly balanced distribution</p>
            </Card>
          </div>

          {/* Workload Distribution Matrix */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Nurse-to-Patient Workload Balancing Matrix</CardTitle>
              <CardDescription className="text-xs">
                Real-time active care assignments, task loads, and acuity balancing across duty nurses.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold">Nurse</TableHead>
                    <TableHead className="text-xs font-bold text-center">Assigned Patients</TableHead>
                    <TableHead className="text-xs font-bold text-center">Tasks Completed</TableHead>
                    <TableHead className="text-xs font-bold text-center">Pending Tasks</TableHead>
                    <TableHead className="text-xs font-bold">Workload Status</TableHead>
                    <TableHead className="text-xs font-bold text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stationNurses.map((n) => {
                    const nurseTasks = stationTasks.filter(t => t.owner_id === n.staff_id);
                    const done = nurseTasks.filter(t => t.status === "Completed").length;
                    const pending = nurseTasks.length - done;
                    const pct = nurseTasks.length > 0 ? Math.round((done / nurseTasks.length) * 100) : 100;
                    return (
                      <TableRow key={n.staff_id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-xs text-foreground">{n.name}</TableCell>
                        <TableCell className="text-center text-xs font-mono font-bold text-primary">{n.assignedPatientsCount} pts</TableCell>
                        <TableCell className="text-center text-xs font-mono text-emerald-600 font-bold">{done}</TableCell>
                        <TableCell className="text-center text-xs font-mono text-amber-600 font-bold">{pending}</TableCell>
                        <TableCell>
                          <Badge className={pending > 2 ? "bg-amber-500/15 text-amber-700 text-[10px]" : "bg-emerald-500/15 text-emerald-700 text-[10px]"}>
                            {pending > 2 ? "High Load" : "Balanced"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={pct} className="w-16 h-1.5" />
                            <span className="text-[11px] font-mono font-semibold">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-SECTION 4: TASKS (PRD Section 13.4)                       */}
      {/* ============================================================ */}
      {activeSubSection === "tasks" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Task Completion Rate</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {stationTasks.length > 0
                  ? Math.round((stationTasks.filter(t => t.status === "Completed").length / stationTasks.length) * 100)
                  : 100}%
              </p>
              <Progress value={stationTasks.length > 0 ? (stationTasks.filter(t => t.status === "Completed").length / stationTasks.length) * 100 : 100} className="h-1.5 mt-2" />
              <p className="text-[11px] text-emerald-600 mt-1">{stationTasks.filter(t => t.status === "Completed").length} of {stationTasks.length} tasks</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Overdue Task Rate</span>
              <p className="text-2xl font-bold font-mono text-amber-600 mt-1">1 Overdue</p>
              <Progress value={20} className="h-1.5 mt-2" />
              <p className="text-[11px] text-amber-600 mt-1">Bed 06 Nebulization alert</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Avg Execution Time</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">8.4 mins</p>
              <p className="text-[11px] text-muted-foreground mt-1">Target SLA: &lt; 15 mins</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Medication Timeliness</span>
              <p className="text-2xl font-bold font-mono text-cyan-600 mt-1">98.1%</p>
              <p className="text-[11px] text-cyan-600 mt-1">eMAR verified compliance</p>
            </Card>
          </div>

          {/* Tasks Execution Audit Table */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Nursing Task Execution &amp; SLA Matrix</CardTitle>
              <CardDescription className="text-xs">
                Active clinical task ledger, priority grading, assigned owner, and deadline tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold">Task Description</TableHead>
                    <TableHead className="text-xs font-bold">Patient / Bed</TableHead>
                    <TableHead className="text-xs font-bold">Assigned Nurse</TableHead>
                    <TableHead className="text-xs font-bold">Priority</TableHead>
                    <TableHead className="text-xs font-bold">Due Time</TableHead>
                    <TableHead className="text-xs font-bold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stationTasks.map((t) => (
                    <TableRow key={t.task_id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs text-foreground">{t.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.patient_name || "General Station"}</TableCell>
                      <TableCell className="text-xs font-medium text-primary">{t.owner_name}</TableCell>
                      <TableCell>
                        <Badge className={
                          t.priority === "High" ? "bg-rose-500/15 text-rose-700 text-[10px]" :
                          t.priority === "Medium" ? "bg-amber-500/15 text-amber-700 text-[10px]" :
                          "bg-muted text-muted-foreground text-[10px]"
                        }>
                          {t.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{t.due_at || "11:30 AM"}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          t.status === "Completed" ? "bg-emerald-500/15 text-emerald-700 text-[10px]" :
                          t.status === "In Progress" ? "bg-cyan-500/15 text-cyan-700 text-[10px]" :
                          "bg-amber-500/15 text-amber-700 text-[10px]"
                        }>
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-SECTION 5: SHIFTS (PRD Section 13.5)                      */}
      {/* ============================================================ */}
      {activeSubSection === "shifts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Shift Coverage Ratio</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">100%</p>
              <Progress value={100} className="h-1.5 mt-2" />
              <p className="text-[11px] text-emerald-600 mt-1">All 3 daily shift windows filled</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Handover Completion Rate</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">100%</p>
              <Progress value={100} className="h-1.5 mt-2" />
              <p className="text-[11px] text-primary mt-1">Zero open handover exceptions</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Shift Swap Requests</span>
              <p className="text-2xl font-bold font-mono text-cyan-600 mt-1">1 Pending</p>
              <p className="text-[11px] text-cyan-600 mt-1">Nurse Meera &rarr; Nurse Rahul</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Understaffing Exceptions</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">0 Flagged</p>
              <p className="text-[11px] text-emerald-600 mt-1">Station in full staffing compliance</p>
            </Card>
          </div>

          {/* Shift Handover Compliance Log */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Shift Handover &amp; Continuity Compliance Log</CardTitle>
              <CardDescription className="text-xs">
                Shift-to-shift transition sign-offs, incoming/outgoing nurse acknowledgements, and open task transfers.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold">Shift Transition</TableHead>
                    <TableHead className="text-xs font-bold">Outgoing Lead</TableHead>
                    <TableHead className="text-xs font-bold">Incoming Lead</TableHead>
                    <TableHead className="text-xs font-bold text-center">Patients Handed Over</TableHead>
                    <TableHead className="text-xs font-bold">Handover Time</TableHead>
                    <TableHead className="text-xs font-bold text-right">Acknowledgement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs text-foreground">Morning &rarr; Evening</TableCell>
                    <TableCell className="text-xs">Sister Anita Joseph</TableCell>
                    <TableCell className="text-xs">Sister Sneha Kulkarni</TableCell>
                    <TableCell className="text-center text-xs font-mono font-bold">4 Patients</TableCell>
                    <TableCell className="text-xs font-mono">14:45 PM (Scheduled)</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-cyan-500/15 text-cyan-700 text-[10px]">Ready for Review</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs text-foreground">Night &rarr; Morning</TableCell>
                    <TableCell className="text-xs">Sister Anjali Desai</TableCell>
                    <TableCell className="text-xs">Sister Anita Joseph</TableCell>
                    <TableCell className="text-center text-xs font-mono font-bold">4 Patients</TableCell>
                    <TableCell className="text-xs font-mono">06:55 AM</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">Acknowledged &amp; Signed</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-SECTION 6: ESCALATIONS (PRD Section 13.7)                 */}
      {/* ============================================================ */}
      {activeSubSection === "escalations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Clinical Escalations Count</span>
              <p className="text-2xl font-bold font-mono text-purple-600 mt-1">{stationEscalations.length} Logged</p>
              <p className="text-[11px] text-muted-foreground mt-1">Past 24 hours</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Doctor Response Time</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">4.2 mins</p>
              <p className="text-[11px] text-emerald-600 mt-1">Target SLA: &lt; 10 mins</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Doctor Orders Assigned</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">{doctorInstructions.length} Orders</p>
              <p className="text-[11px] text-primary mt-1">All instructions acknowledged</p>
            </Card>

            <Card className="p-4 border-border bg-card shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground">Unresolved Escalations</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">0 Open</p>
              <p className="text-[11px] text-emerald-600 mt-1">All clinical alerts resolved</p>
            </Card>
          </div>

          {/* Clinical Escalations Ledger */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Clinical Escalations &amp; Doctor Coordination Audit</CardTitle>
              <CardDescription className="text-xs">
                Chronological ledger of vital signs alerts, physician communications, and resolution timestamps.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold">Patient / Bed</TableHead>
                    <TableHead className="text-xs font-bold">Escalation Reason</TableHead>
                    <TableHead className="text-xs font-bold">Severity</TableHead>
                    <TableHead className="text-xs font-bold">Attending Doctor</TableHead>
                    <TableHead className="text-xs font-bold">Response Time</TableHead>
                    <TableHead className="text-xs font-bold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stationEscalations.map((e) => (
                    <TableRow key={e.escalation_id} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-xs text-foreground">{e.patient_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.reason}</TableCell>
                      <TableCell>
                        <Badge className={
                          e.priority === "Urgent" ? "bg-rose-500/15 text-rose-700 text-[10px]" :
                          "bg-amber-500/15 text-amber-700 text-[10px]"
                        }>
                          {e.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-primary">{e.responsible_doctor || "Dr. Ananya Patel"}</TableCell>
                      <TableCell className="text-xs font-mono">3.5 mins</TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          e.status === "Resolved" ? "bg-emerald-500/15 text-emerald-700 text-[10px]" :
                          "bg-cyan-500/15 text-cyan-700 text-[10px]"
                        }>
                          {e.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
