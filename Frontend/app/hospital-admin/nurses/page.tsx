"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/hospital-admin/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, UserCheck, Stethoscope, Award, ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { NursesNav } from "@/hospital-admin/components/nurses/nurses-nav";
import { NurseForm } from "@/hospital-admin/components/nurses/NurseForm";
import { nurses as initialNurses } from "@/hospital-admin/lib/mock-data/staff";
import { mockStations } from "@/hospital-admin/lib/mock/nursing";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { getInitials } from "@/hospital-admin/lib/utils";

export default function NursesPage() {
  const [mounted, setMounted] = useState(false);
  const [nursesList, setNursesList] = useState(initialNurses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = (nurse: any) => {
    setEditingNurse(nurse);
    setIsFormOpen(true);
  };

  const handleDeactivate = (nurse: any) => {
    toast({
      title: "Nurse Status Updated",
      description: `${nurse.name} marked as Off Duty.`,
    });
  };

  const filteredNurses = nursesList.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.id.toLowerCase().includes(search.toLowerCase()) ||
      (n.councilRegistrationId && n.councilRegistrationId.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = departmentFilter === "all" || n.department === departmentFilter;
    const matchesStation = stationFilter === "all" || n.station === stationFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "On Duty" && n.status === "active") ||
      (statusFilter === "Off Duty" && n.status === "suspended");

    return matchesSearch && matchesDept && matchesStation && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">On Duty</Badge>;
      case "suspended":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">Off Duty</Badge>;
      default:
        return <Badge variant="secondary">On Leave</Badge>;
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Global Nursing Directory"
          description="Master registry of hospital nursing workforce, council credentials, and station assignments."
          crumbs={[{ label: "People & Staff" }, { label: "Nurses" }]}
        />
        <NursesNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading nursing directory...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Global Nursing Directory"
        description="Master registry of hospital nursing workforce, council credentials, and station assignments."
        crumbs={[{ label: "People & Staff" }, { label: "Nurses" }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-xs"
            onClick={() => {
              setEditingNurse(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Register Nurse
          </Button>
        }
      />

      <NursesNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Nursing Workforce</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{nursesList.length} Nurses</p>
          <span className="text-[10px] text-muted-foreground">100% Council Registered</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Currently On Duty</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {nursesList.filter((n) => n.status === "active").length} Staff
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Active at Stations</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Medication Compliance</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">99.4%</p>
          <span className="text-[10px] text-cyan-600 font-medium">Verified by Audit Trail</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Punctuality Score</span>
          <p className="text-xl font-bold font-mono text-violet-600 mt-0.5">97.8%</p>
          <span className="text-[10px] text-violet-600 font-medium">Synced with Attendance</span>
        </Card>
      </div>

      {/* Main Directory Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Nursing Roster Directory</CardTitle>
          <CardDescription className="text-xs">
            Filter by clinical scope, station, department, and live duty status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or council #..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px] text-xs h-9">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="General Ward">General Ward</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="OT Complex">OT Complex</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="PACU Recovery">PACU Recovery</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="Nurse Station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  <SelectItem value="Station A1">Station A1</SelectItem>
                  <SelectItem value="Station ICU-1">Station ICU-1</SelectItem>
                  <SelectItem value="Station OT-Main">Station OT-Main</SelectItem>
                  <SelectItem value="Station Peds-1">Station Peds-1</SelectItem>
                  <SelectItem value="Station PACU-1">Station PACU-1</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="On Duty">On Duty</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Nurse Profile</TableHead>
                  <TableHead className="text-xs font-bold">Role &amp; Council ID</TableHead>
                  <TableHead className="text-xs font-bold">Department / Station</TableHead>
                  <TableHead className="text-xs font-bold">Current Shift</TableHead>
                  <TableHead className="text-xs font-bold">Performance</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNurses.map((nurse) => (
                  <TableRow key={nurse.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Link href={`/hospital-admin/nurses/${nurse.id}`} className="flex items-center gap-3 group">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarImage src={nurse.avatarUrl} alt={nurse.name} />
                          <AvatarFallback className="text-xs font-bold">{getInitials(nurse.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {nurse.name}
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-muted-foreground">{nurse.email}</div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium">{nurse.level}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {nurse.councilRegistrationId || "MNC-RN-REGISTERED"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium">{nurse.department}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <HeartPulse className="h-3 w-3 text-rose-500" />
                        {nurse.station}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {nurse.shift} Shift
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-emerald-600 font-mono">
                        {nurse.vitalsCompletionRate || 98}% Vitals
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {nurse.punctualityScore || 97}% Punctuality
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(nurse.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem asChild>
                            <Link href={`/hospital-admin/nurses/${nurse.id}`}>View Full Profile &amp; Performance</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(nurse)}>
                            Edit Credentials &amp; Station
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeactivate(nurse)} className="text-rose-600">
                            Update Duty Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <NurseForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} nurse={editingNurse} />
    </div>
  );
}
