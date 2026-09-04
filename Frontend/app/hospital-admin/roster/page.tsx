"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  HeartPulse,
  Layers,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  XCircle,
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
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { RosterNav } from "@/hospital-admin/components/roster/roster-nav";
import { RosterGrid } from "@/hospital-admin/components/roster/RosterGrid";
import { ShiftChangeRequests } from "@/hospital-admin/components/roster/ShiftChangeRequests";
import { ShiftOverlapWarning } from "@/hospital-admin/components/roster/ShiftOverlapWarning";
import { reviewStaffRequest, submitStaffRequest } from "@/hospital-admin/store/slices/nursingOperationsSlice";
import { doctorsOnCall as initialDoctorsOnCall, leaveRequests as initialLeaveRequests } from "@/hospital-admin/lib/mock-data/staff";
import { DoctorOnCall, LeaveRequest } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function RosterPage() {
  const dispatch = useDispatch();
  const nursing = useSelector((state: RootState) => state.nursingOperations);
  const [mounted, setMounted] = useState(false);
  const staffList = [...nursing.nurses.map((item) => ({ id: item.staff_id, name: item.name, stationId: item.station_id, department: item.department_name, roleScope: item.role, status: item.availability, qualifications: item.qualifications })), ...nursing.supportStaff.map((item) => ({ id: item.staff_id, name: item.name, stationId: item.station_id, type: item.category, status: item.availability }))];
  const nursingRoster = nursing.roster.map((item) => ({ id: item.roster_id, staffId: item.staff_id, staffType: item.staff_type, shiftTemplateId: item.shift_id, date: item.date, stationId: item.station_id, status: item.status }));
  const nursingShifts = nursing.shiftTemplates.map((item) => ({ id: item.shift_id, name: item.name, startTime: item.start_time, endTime: item.end_time, isDefault: item.is_default }));
  const nursingRequests = nursing.staffRequests.map((item) => ({ id: item.request_id, staffId: item.staff_id, rosterEntryId: "", targetShiftTemplateId: nursing.shiftTemplates.find((shift) => shift.name === item.target_shift)?.shift_id || "sh-1", targetDate: item.target_date || "", status: item.status, reason: item.reason }));

  const [activeTab, setActiveTab] = useState("roster");
  const [hospitalWide, setHospitalWide] = useState(true);
  const [selectedStation, setSelectedStation] = useState("all");
  const [overlapWarningOpen, setOverlapWarningOpen] = useState(false);

  // Doctor on-call and leave states
  const [doctorsOnCallList, setDoctorsOnCallList] = useState<DoctorOnCall[]>(initialDoctorsOnCall);
  const [leavesList, setLeavesList] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  // Leave Request Form State
  const [selectedLeaveStaffId, setSelectedLeaveStaffId] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveRequest["leaveType"]>("Casual Leave");
  const [leaveStartDate, setLeaveStartDate] = useState("2026-08-25");
  const [leaveEndDate, setLeaveEndDate] = useState("2026-08-26");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveCoverageGap, setLeaveCoverageGap] = useState(false);

  // Coverage Gap dialog state
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);
  const [targetLeaveForApproval, setTargetLeaveForApproval] = useState<LeaveRequest | null>(null);
  const [selectedBackupStaff, setSelectedBackupStaff] = useState("nur_001");

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenLeaveModal = () => {
    setSelectedLeaveStaffId(staffList[0]?.id || "nur_001");
    setLeaveType("Casual Leave");
    setLeaveStartDate("2026-08-25");
    setLeaveEndDate("2026-08-26");
    setLeaveReason("");
    setLeaveCoverageGap(false);
    setLeaveModalOpen(true);
  };

  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find((s) => s.id === selectedLeaveStaffId);
    if (!staff) {
      toast({ title: "Select Staff", description: "Please select a staff member.", variant: "destructive" });
      return;
    }
    if (!leaveReason.trim()) {
      toast({ title: "Reason Required", description: "Please provide a reason for the leave request.", variant: "destructive" });
      return;
    }

    const newLeave: LeaveRequest = {
      id: `LV-${Date.now().toString().slice(-4)}`,
      staffId: staff.id,
      staffName: staff.name,
      staffRole: "roleScope" in staff ? String(staff.roleScope) : "type" in staff ? String(staff.type) : "Staff",
      department: "department" in staff ? String(staff.department) : "General Ward",
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason,
      status: "Pending",
      coverageGapDetected: leaveCoverageGap,
      appliedOn: new Date().toISOString().split("T")[0],
    };

    setLeavesList((prev) => [newLeave, ...prev]);

    const staffRoleStr = "roleScope" in staff ? String(staff.roleScope) : "type" in staff ? String(staff.type) : "Staff";
    const deptStr = "department" in staff ? String(staff.department) : "General Ward";

    dispatch(
      submitStaffRequest({
        staff_id: staff.id,
        staff_name: staff.name,
        staff_role: staffRoleStr,
        station_id: "stationId" in staff && staff.stationId ? String(staff.stationId) : "st-1",
        type: "Leave Request",
        details: `${leaveType} from ${leaveStartDate} to ${leaveEndDate} (${deptStr})`,
        target_date: leaveStartDate,
        reason: `${leaveType}: ${leaveReason}`,
      })
    );

    toast({
      title: "Leave Request Logged",
      description: `Leave request for ${staff.name} (${leaveType}) has been logged and submitted for approval.`,
    });

    setLeaveModalOpen(false);
    setLeaveReason("");
  };

  // Filter roster by role scope (PRD Section 12 & Section 20)
  const canManageRoster = ["admin", "nurse_lead"].includes(nursing.currentRole);
  const visibleRoster = canManageRoster ? nursingRoster : nursingRoster.filter((item) => item.staffId === nursing.currentUserId);
  let filteredRoster = visibleRoster;
  if (!hospitalWide && selectedStation !== "all") {
    filteredRoster = visibleRoster.filter((r) => r.stationId === selectedStation);
  }

  // Nurse-only roster
  const nurseOnlyRoster = filteredRoster.filter((r) => r.staffType === "Nurse");

  // Handle Leave Approval with Coverage Gap Check (Rule F10-CANNOT-2)
  const handleApproveLeaveClick = (leave: LeaveRequest) => {
    if (leave.coverageGapDetected && !leave.assignedBackupStaffId) {
      setTargetLeaveForApproval(leave);
      setCoverageModalOpen(true);
      return;
    }

    setLeavesList((prev) =>
      prev.map((l) => (l.id === leave.id ? { ...l, status: "Approved" } : l))
    );
    toast({
      title: "Leave Approved",
      description: `Leave request for ${leave.staffName} approved. Reflected in Attendance register.`,
    });
  };

  const handleConfirmBackupAndApprove = () => {
    if (!targetLeaveForApproval) return;
    const backupStaff = staffList.find((n) => n.id === selectedBackupStaff);

    setLeavesList((prev) =>
      prev.map((l) =>
        l.id === targetLeaveForApproval.id
          ? {
              ...l,
              status: "Approved",
              assignedBackupStaffId: selectedBackupStaff,
              assignedBackupStaffName: backupStaff?.name || "Assigned Backup",
              coverageGapDetected: false,
            }
          : l
      )
    );

    toast({
      title: "Leave Approved with Backup Assigned",
      description: `Assigned ${backupStaff?.name} to cover shift for ${targetLeaveForApproval.staffName}.`,
    });
    setCoverageModalOpen(false);
    setTargetLeaveForApproval(null);
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeavesList((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: "Rejected" } : l))
    );
    toast({
      title: "Leave Request Rejected",
      description: "Staff member notified of shift coverage requirement.",
      variant: "destructive",
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Hospital Workforce Roster &amp; Duty Schedules"
          description="Global shift matrix, doctor on-call emergency desks, staff scheduling engine, and leave coverage governance."
          crumbs={[{ label: "People & Staff" }, { label: "Duty & Shifts" }]}
        />
        <RosterNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading roster system...
        </div>
      </div>
    );
  }

  const visibleRequests = canManageRoster
    ? nursingRequests
    : nursingRequests.filter((r) => r.staffId === nursing.currentUserId);

  const visibleLeaves = canManageRoster
    ? leavesList
    : leavesList.filter(
        (l) =>
          l.staffId === nursing.currentUserId ||
          l.staffName?.toLowerCase().includes((nursing.currentUserName || "").toLowerCase())
      );

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title={canManageRoster ? "Hospital Workforce Roster & Duty Schedules" : "My Shift Schedule & Requests"}
        description={
          canManageRoster
            ? "Global shift matrix, doctor on-call emergency desks, staff scheduling engine, and leave coverage governance."
            : "View your assigned shift rotation, submit peer shift swap requests, and log leave requests."
        }
        crumbs={canManageRoster ? [{ label: "People & Staff" }, { label: "Duty & Shifts" }] : [{ label: "My Bedside Workspace" }, { label: "My Shift Schedule" }]}
        actions={
          <div className="flex items-center gap-2">
            {canManageRoster && (
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setOverlapWarningOpen(true)}>
                <ShieldAlert className="h-3.5 w-3.5 mr-1 text-amber-600" /> Overlap Check
              </Button>
            )}
            <Button size="sm" className="text-xs font-semibold" onClick={handleOpenLeaveModal}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Log Leave Request
            </Button>
          </div>
        }
      />

      {canManageRoster && <RosterNav />}

      {/* KPI Ribbon */}
      {canManageRoster ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Staff Scheduled</span>
            <p className="text-xl font-bold font-mono text-primary mt-0.5">{staffList.length} Personnel</p>
            <span className="text-[10px] text-muted-foreground">Nurses &amp; Support Workforce</span>
          </Card>
          <Card className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Doctors On-Call</span>
            <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
              {doctorsOnCallList.filter((d) => d.status === "On Call").length} On Standby
            </p>
            <span className="text-[10px] text-cyan-600 font-medium">Emergency &amp; Trauma Specialists</span>
          </Card>
          <Card className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Shift Swaps</span>
            <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
              {nursingRequests.filter((r) => r.status === "Pending").length} Requests
            </p>
            <span className="text-[10px] text-amber-600 font-medium">Awaiting Admin approval</span>
          </Card>
          <Card className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Coverage Gaps Flagged</span>
            <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
              {leavesList.filter((l) => l.status === "Pending" && l.coverageGapDetected).length} Gaps
            </p>
            <span className="text-[10px] text-rose-600 font-medium">Requires replacement assignment</span>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">My Assigned Shifts</span>
            <p className="text-xl font-bold font-mono text-primary mt-0.5">7 Shifts</p>
            <span className="text-[10px] text-muted-foreground">Mon 24 Aug – Sun 30 Aug</span>
          </Card>
          <Card className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Today&apos;s Active Shift</span>
            <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Morning</p>
            <span className="text-[10px] text-emerald-600 font-medium">07:00 AM – 15:00 PM · On Duty</span>
          </Card>
          <Card className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">My Shift Swaps</span>
            <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
              {visibleRequests.filter((r) => r.status === "Pending").length} Pending
            </p>
            <span className="text-[10px] text-amber-600 font-medium">Peer exchange requests</span>
          </Card>
          <Card className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">My Leave Requests</span>
            <p className="text-xl font-bold font-mono text-primary mt-0.5">
              {visibleLeaves.length} Logged
            </p>
            <span className="text-[10px] text-muted-foreground">Personal leave tracking</span>
          </Card>
        </div>
      )}

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 border border-border">
          <TabsTrigger value="roster" className="text-xs">
            {canManageRoster ? "Global Shift Roster" : "My Shift Schedule"}
          </TabsTrigger>
          {canManageRoster && (
            <>
              <TabsTrigger value="scheduling" className="text-xs">
                Staff Scheduling Engine
              </TabsTrigger>
              <TabsTrigger value="doctors" className="text-xs">
                Doctor On-Call ({doctorsOnCallList.length})
              </TabsTrigger>
              <TabsTrigger value="nurses" className="text-xs">
                Nurse-Only Roster
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="swaps" className="text-xs">
            {canManageRoster ? `Shift Swaps (${nursingRequests.length})` : `My Shift Swaps (${visibleRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="leave" className="text-xs">
            {canManageRoster
              ? `Leave Requests (${leavesList.filter((l) => l.status === "Pending").length})`
              : `My Leave Requests (${visibleLeaves.length})`}
          </TabsTrigger>
          {canManageRoster && (
            <TabsTrigger value="coverage" className="text-xs">
              Coverage Analyzer
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: Shift Roster */}
        <TabsContent value="roster" className="space-y-4">
          {canManageRoster && (
            <div className="flex justify-between items-center bg-card p-3 rounded-lg border border-border">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch id="hospital-wide" checked={hospitalWide} onCheckedChange={setHospitalWide} />
                  <Label htmlFor="hospital-wide" className="text-xs font-semibold cursor-pointer">
                    Hospital-wide View
                  </Label>
                </div>

                {!hospitalWide && (
                  <Select value={selectedStation} onValueChange={setSelectedStation}>
                    <SelectTrigger className="w-[180px] text-xs h-8">
                      <SelectValue placeholder="Filter by Station" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stations</SelectItem>
                      {nursing.stations.map((s) => (
                        <SelectItem key={s.station_id} value={s.station_id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Showing assignments across Morning, Evening &amp; Night shift windows.
              </div>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border shadow-xs overflow-hidden">
            <RosterGrid roster={filteredRoster as any} staffList={staffList as any} shiftTemplates={nursingShifts as any} />
          </div>
        </TabsContent>

        {/* Tab 2: Staff Scheduling Engine */}
        <TabsContent value="scheduling" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Intelligent Staff Scheduling Engine</CardTitle>
              <CardDescription className="text-xs">
                Auto-suggest optimal shift allocations across all departments based on shift templates, nurse-to-patient ratios, and availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-1">
                  <div className="text-xs font-bold">1. Select Target Department</div>
                  <Select defaultValue="Intensive Care">
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intensive Care">Intensive Care Unit (ICU)</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics Wing A</SelectItem>
                      <SelectItem value="Emergency">Emergency Intake</SelectItem>
                      <SelectItem value="General Wards">General Inpatient Wards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-1">
                  <div className="text-xs font-bold">2. Template Profile</div>
                  <Select defaultValue="Standard 3-Shift Rotation">
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard 3-Shift Rotation">Standard 3-Shift Rotation</SelectItem>
                      <SelectItem value="Weekend High-Acuity ICU Ratio">Weekend High-Acuity ICU Ratio</SelectItem>
                      <SelectItem value="Night Emergency Standby">Night Emergency Standby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/10 flex flex-col justify-end">
                  <Button
                    size="sm"
                    className="text-xs font-semibold"
                    onClick={() => {
                      toast({
                        title: "Schedule Auto-Generated",
                        description: "Optimized shift allocations generated with 0 overlap conflicts.",
                      });
                    }}
                  >
                    Run Schedule Auto-Suggester
                  </Button>
                </div>
              </div>

              <div className="rounded-md border border-border p-4 bg-muted/20 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Recommended Weekly Allocation Ready
                </div>
                <p className="text-muted-foreground">
                  The engine balanced 5 Senior Staff Nurses, 3 Charge Nurses, and 2 Orderlies across ICU Station 1. All mandatory 1:2 nurse-to-bed ratios satisfied.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Doctor On-Call Roster (Rule F10-CANNOT-6: synchronized with /doctors) */}
        <TabsContent value="doctors" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Doctor Emergency On-Call Roster</CardTitle>
              <CardDescription className="text-xs">
                Synchronized with Doctor Management emergency availability status. 24x7 trauma and specialty coverage.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Specialist Doctor</TableHead>
                      <TableHead className="text-xs font-bold">Specialty Coverage</TableHead>
                      <TableHead className="text-xs font-bold">Shift Hours Window</TableHead>
                      <TableHead className="text-xs font-bold">Emergency Phone</TableHead>
                      <TableHead className="text-xs font-bold">Active Cases</TableHead>
                      <TableHead className="text-xs font-bold">On-Call Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorsOnCallList.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-primary" />
                          {doc.doctorName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {doc.specialty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{doc.shiftWindow}</TableCell>
                        <TableCell className="text-xs font-mono flex items-center gap-1">
                          <Phone className="h-3 w-3 text-emerald-600" />
                          {doc.phone}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-primary">
                          {doc.activeEmergencyCases} Active
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                            {doc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Nurse Dedicated Roster */}
        <TabsContent value="nurses" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Nurse-Only Shift Matrix Lens</CardTitle>
              <CardDescription className="text-xs">
                Filtered view showing nursing workforce assignments across all inpatient floors and stations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <RosterGrid roster={nurseOnlyRoster as any} staffList={staffList.filter((staff) => "roleScope" in staff) as any} shiftTemplates={nursingShifts as any} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Shift Swaps */}
        <TabsContent value="swaps" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">
                {canManageRoster ? "Peer Shift Swap & Exchange Requests" : "My Shift Swap & Exchange Requests"}
              </CardTitle>
              <CardDescription className="text-xs">
                {canManageRoster
                  ? "Staff-submitted swap requests with real-time schedule recalculation upon approval."
                  : "Track status of your submitted shift exchange and relief requests with peer nurses."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <ShiftChangeRequests
                requests={visibleRequests as any}
                staffList={staffList.filter((staff) => "roleScope" in staff) as any}
                shiftTemplates={nursingShifts as any}
                onReview={(requestId, status) => dispatch(reviewStaffRequest({ requestId, status, reviewer: nursing.currentUserName }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Leave Management Workflow */}
        <TabsContent value="leave" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">
                {canManageRoster ? "Leave Requests & Approvals Workflow" : "My Leave Requests & Absence History"}
              </CardTitle>
              <CardDescription className="text-xs">
                {canManageRoster
                  ? "Sick, Casual, and Earned leave requests with automatic coverage gap detection."
                  : "View approval status and coverage tracking for your logged leaves."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Staff Member</TableHead>
                      <TableHead className="text-xs font-bold">Leave Type</TableHead>
                      <TableHead className="text-xs font-bold">Period</TableHead>
                      <TableHead className="text-xs font-bold">Reason</TableHead>
                      <TableHead className="text-xs font-bold">Coverage Status</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right">Decision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleLeaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{leave.staffName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {leave.staffRole} • {leave.department}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {leave.leaveType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {leave.startDate} to {leave.endDate}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{leave.reason}</TableCell>
                        <TableCell>
                          {leave.coverageGapDetected ? (
                            <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]">
                              Gap Flagged
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                              Backup Assigned ({leave.assignedBackupStaffName})
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              leave.status === "Approved"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                                : leave.status === "Rejected"
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            }
                          >
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {canManageRoster ? (
                            leave.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-emerald-600 hover:bg-emerald-500/10"
                                  onClick={() => handleApproveLeaveClick(leave)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-rose-600 hover:bg-rose-500/10"
                                  onClick={() => handleRejectLeave(leave.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              {leave.status === "Pending" ? "Awaiting Review" : "Processed"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Coverage Analyzer */}
        <TabsContent value="coverage" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Station Coverage &amp; Understaffing Analyzer</CardTitle>
              <CardDescription className="text-xs">
                Real-time safety guard analyzing minimum staffing quotas per station across future shifts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="p-3.5 border-border bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">ICU Station 1</span>
                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]">
                      Fully Staffed
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    5 Nurses assigned • Bed occupancy: 8/10 (1:2 ratio satisfied).
                  </p>
                </Card>

                <Card className="p-3.5 border-border bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">OT Complex Main</span>
                    <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]">
                      Watch Alert
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    1 Scrub Nurse on leave (Aug 24) • Backup cover required.
                  </p>
                </Card>

                <Card className="p-3.5 border-border bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Pediatrics Wing A</span>
                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]">
                      Fully Staffed
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    3 Nurses assigned • All shift windows covered.
                  </p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Leave Request Modal */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreateLeaveRequest}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Log Staff Leave Request
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit an employee leave request with automatic shift coverage analysis and approval workflow.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="leave-staff">Staff Member *</Label>
                <Select value={selectedLeaveStaffId} onValueChange={setSelectedLeaveStaffId}>
                  <SelectTrigger id="leave-staff" className="text-xs">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({"roleScope" in s ? s.roleScope : "type" in s ? s.type : "Staff"} • {"department" in s ? s.department : "General"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={leaveType} onValueChange={(v: any) => setLeaveType(v)}>
                    <SelectTrigger id="leave-type" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual Leave">Casual Leave (CL)</SelectItem>
                      <SelectItem value="Sick Leave">Sick / Medical Leave (SL)</SelectItem>
                      <SelectItem value="Earned Leave">Earned Annual Leave (EL)</SelectItem>
                      <SelectItem value="Compensatory Off">Compensatory Off (Comp-Off)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="leave-gap">Coverage Gap Alert</Label>
                  <div className="flex items-center justify-between h-9 px-3 rounded-md border border-border bg-muted/20">
                    <span className="text-[11px] text-muted-foreground">Flag Understaffing</span>
                    <Switch
                      id="leave-gap"
                      checked={leaveCoverageGap}
                      onCheckedChange={setLeaveCoverageGap}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="leave-start">Start Date *</Label>
                  <Input
                    id="leave-start"
                    type="date"
                    required
                    className="text-xs"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="leave-end">End Date *</Label>
                  <Input
                    id="leave-end"
                    type="date"
                    required
                    className="text-xs"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="leave-reason">Reason / Justification *</Label>
                <Input
                  id="leave-reason"
                  required
                  placeholder="e.g. Scheduled family leave / Medical emergency"
                  className="text-xs"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold">
                Submit Leave Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coverage Gap Resolve Modal (Rule F10-CANNOT-2) */}
      <Dialog open={coverageModalOpen} onOpenChange={setCoverageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" /> Coverage Gap Detected
            </DialogTitle>
            <DialogDescription className="text-xs">
              Approving leave for {targetLeaveForApproval?.staffName} ({targetLeaveForApproval?.department}) will leave the shift understaffed. Assign a replacement staff member to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div className="space-y-1">
              <Label htmlFor="backup-staff">Select Backup Replacement Staff</Label>
              <Select value={selectedBackupStaff} onValueChange={setSelectedBackupStaff}>
                <SelectTrigger id="backup-staff" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {staffList.filter((staff) => "roleScope" in staff).map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name} ({n.roleScope} • {n.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setCoverageModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmBackupAndApprove}>
              Assign Backup &amp; Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShiftOverlapWarning
        isOpen={overlapWarningOpen}
        onClose={() => setOverlapWarningOpen(false)}
        onConfirm={() => setOverlapWarningOpen(false)}
        staffName="Priya Sharma"
        overlapDetails="Morning Shift (06:00-14:00) overlaps with requested Morning Shift assignment on same date."
      />
    </div>
  );
}
