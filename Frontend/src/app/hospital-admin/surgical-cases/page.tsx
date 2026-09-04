"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Input } from "@/hospital-admin/components/ui/input";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Search, Plus, Filter, Calendar as CalendarIcon, Clock, Users, CheckCircle2, AlertCircle, Zap, Scissors } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";

export default function SurgicalCasesPage() {
  const [mounted, setMounted] = useState(false);
  const { cases, surgeons, otRooms } = useSelector((state: RootState) => state.surgical);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [readinessFilter, setReadinessFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesDepartment = departmentFilter === "ALL" || c.department === departmentFilter;
    const matchesDate = !dateFilter || format(new Date(c.preferredDateTime), "yyyy-MM-dd") === dateFilter;
    
    let matchesReadiness = true;
    if (readinessFilter === "READY") matchesReadiness = c.readinessPercent === 100;
    if (readinessFilter === "BLOCKED") matchesReadiness = c.status === "Blocked";
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesDate && matchesReadiness;
  });

  const getReadinessColor = (percent: number) => {
    if (percent === 100) return "text-emerald-700 bg-emerald-500/10 border-emerald-500/30";
    if (percent >= 50) return "text-amber-700 bg-amber-500/10 border-amber-500/30";
    return "text-rose-700 bg-rose-500/10 border-rose-500/30";
  };

  const getSurgeonName = (caseData: any) => {
    if (caseData.assignedSurgeonName) return caseData.assignedSurgeonName;
    if (!caseData.assignedSurgeonId) return "Unassigned";
    const surgeon = surgeons.find(s => s.id === caseData.assignedSurgeonId);
    return surgeon ? surgeon.name : caseData.assignedSurgeonId;
  };

  const getOTSlotInfo = (caseData: any) => {
    if (!caseData.allocatedOT) return "Unscheduled";
    const room = otRooms.find(r => r.id === caseData.allocatedOT.roomId);
    const roomName = room ? room.name : caseData.allocatedOT.roomId;
    return `${roomName} (${format(new Date(caseData.allocatedOT.startDateTime), "MMM d, HH:mm")})`;
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Surgical Cases Directory"
          description="Unified roster of all elective and emergency surgeries with live pre-op readiness and OT slot tracking."
          crumbs={[{ label: "OT & Surgeries" }, { label: "Surgical Cases" }]}
        />
        <SurgicalNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading surgical directory...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Surgical Cases Directory"
        description="Unified roster of all elective and emergency surgeries with live pre-op readiness and OT slot tracking."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Surgical Cases" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="text-rose-600 hover:bg-rose-500/10 font-semibold gap-1.5 text-xs">
              <Link href="/hospital-admin/surgical-cases/emergency">
                <Zap className="h-4 w-4" /> Emergency Fast-Track
              </Link>
            </Button>
            <Button size="sm" asChild className="gap-1.5 font-semibold text-xs">
              <Link href="/hospital-admin/surgical-cases/create">
                <Plus className="h-4 w-4" /> New Surgical Case
              </Link>
            </Button>
          </div>
        }
      />

      <SurgicalNav />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Active Roster</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{cases.length} Cases</p>
          <span className="text-[10px] text-muted-foreground">Elective &amp; Emergency</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">100% Ready for OT</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {cases.filter((c) => c.readinessPercent === 100).length} Cases
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">All clearances done</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Blocked by Dependencies</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {cases.filter((c) => c.status === "Blocked").length} Cases
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Missing blood/implants/PAC</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Scheduled in OR</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {cases.filter((c) => c.status === "Scheduled").length} Cases
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">OT slot confirmed</span>
        </Card>
      </div>

      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Active Cases Directory</CardTitle>
          <CardDescription className="text-xs">Filter by department, urgency, readiness percentage, and operating date.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or Patient Name..."
                className="pl-8 h-9 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Input 
                type="date" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto h-9 text-xs"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Depts</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="General Surgery">General Surgery</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Surgeon</TableHead>
                  <TableHead>OT Allocation</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-bold text-primary">{c.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{c.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{c.patientId}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">{c.procedureType}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.department}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(c.preferredDateTime), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${getReadinessColor(c.readinessPercent)}`}>
                        {c.readinessPercent}% Ready
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{getSurgeonName(c)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{getOTSlotInfo(c)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/hospital-admin/surgical-cases/${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                          Manage
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                      No surgical cases match the selected filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
