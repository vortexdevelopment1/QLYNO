"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Clock,
  Send,
  Pill,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Activity,
  HeartPulse,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { CommunicationNav } from "@/hospital-admin/components/care-coordination/communication/communication-nav";
import { mockMedicationReminders } from "@/hospital-admin/lib/mock-data/communication-hub";
import { MedicationReminderItem } from "@/hospital-admin/lib/types";

export default function RemindersHubPage() {
  const [reminders, setReminders] = useState<MedicationReminderItem[]>(mockMedicationReminders);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSendSingle = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Sent", scheduledTime: "Dispatched just now" } : r
      )
    );
  };

  const handleBatchDispatch = () => {
    setReminders((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) || r.status === "Pending"
          ? { ...r, status: "Sent", scheduledTime: "Dispatched just now" }
          : r
      )
    );
    setSelectedIds([]);
  };

  const filteredReminders = reminders.filter((rem) => {
    const matchesSearch =
      rem.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rem.patientUhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rem.medicationOrService.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rem.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || rem.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || rem.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Adherence & Recalls
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Medication & Follow-Up Reminders Hub
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Automated chronic medication compliance alerts, post-op doctor follow-up recalls, and diagnostic repeats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/hospital-admin/pharmacy">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Pill className="h-3.5 w-3.5 text-primary" />
                Pharmacy Dispatches
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleBatchDispatch}
              className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Zap className="h-3.5 w-3.5" />
              Batch Dispatch Pending ({reminders.filter((r) => r.status === "Pending").length})
            </Button>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <CommunicationNav
        unreadChatCount={3}
        activeBroadcastCount={1}
        pendingRemindersCount={reminders.filter((r) => r.status === "Pending").length}
      />

      <div className="flex-1 space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Medication Schedules
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Pill className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">1,420</span>
                <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-500/30">
                  Daily Active
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Hypertension, Diabetes, Post-CABG regimens
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Follow-Up Recall Compliance
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <HeartPulse className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">87.4%</span>
                <span className="text-xs text-emerald-600 font-medium">+14% vs avg</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Patients re-booking within 14 days of discharge
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Today's Queue
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {reminders.filter((r) => r.status === "Pending").length}
                </span>
                <span className="text-xs text-amber-600 font-medium">Ready</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Scheduled for automated WhatsApp/SMS dispatch
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Patient Adherence Score
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                <Sparkles className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">92.1%</span>
                <Badge variant="outline" className="text-[10px] text-teal-600 border-teal-500/30 bg-teal-500/10">
                  NABH Benchmark
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Self-reported via interactive WhatsApp bot
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reminders Table */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-600" />
                  Scheduled Reminders & Follow-Up Tracker
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated schedules generated from E-Prescriptions (F4) and Discharge Summaries (F3).
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search patient, medication, doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="Reminder Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Types</SelectItem>
                    <SelectItem value="Medication" className="text-xs">Medication Regimen</SelectItem>
                    <SelectItem value="FollowUp" className="text-xs">Follow-Up Consultation</SelectItem>
                    <SelectItem value="LabTest" className="text-xs">Lab Test Repeat</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Status</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="sent" className="text-xs">Sent / Dispatched</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Patient & UHID</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Medication / Instruction / Service</th>
                    <th className="px-4 py-3">Frequency / Slot</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredReminders.map((rem) => (
                    <tr key={rem.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{rem.patientName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {rem.patientUhid} • {rem.patientPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {rem.type === "Medication" && (
                          <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-500/30 bg-indigo-500/10">
                            Medication
                          </Badge>
                        )}
                        {rem.type === "FollowUp" && (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                            Follow-Up
                          </Badge>
                        )}
                        {rem.type === "LabTest" && (
                          <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30 bg-purple-500/10">
                            Lab Repeat
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {rem.medicationOrService}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[11px] font-medium">{rem.frequency}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {rem.scheduledTime}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {rem.doctorName}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {rem.channel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {rem.status === "Sent" ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Dispatched
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 font-medium text-[11px]">
                            <Clock className="h-3.5 w-3.5" />
                            Pending Dispatch
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rem.status === "Pending" ? (
                          <Button
                            size="sm"
                            onClick={() => handleSendSingle(rem.id)}
                            className="h-7 text-[11px] gap-1 px-2 bg-primary"
                          >
                            <Send className="h-3 w-3" />
                            Send Now
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
