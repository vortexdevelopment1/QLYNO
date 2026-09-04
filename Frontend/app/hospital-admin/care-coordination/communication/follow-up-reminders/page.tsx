"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellRing,
  Search,
  Send,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  Radio,
  Smartphone,
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
import { mockFollowUpReminders } from "@/hospital-admin/lib/mock-data/communication-hub";
import { FollowUpReminderRecord } from "@/hospital-admin/lib/types";

export default function FollowUpRemindersPage() {
  const [reminders, setReminders] = useState<FollowUpReminderRecord[]>(mockFollowUpReminders);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleSend = (id: string) => {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id && (item.status === "Pending" || item.status === "Overdue")
          ? { ...item, status: "Sent", scheduledFor: "Dispatched just now" }
          : item
      )
    );
  };

  const handleBatch = () => {
    setReminders((prev) =>
      prev.map((item) =>
        item.status === "Pending" || item.status === "Overdue"
          ? { ...item, status: "Sent", scheduledFor: "Dispatched just now" }
          : item
      )
    );
  };

  const filtered = reminders.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientUhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.procedureOrCondition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.recallType === typeFilter;
    const matchesStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingCount = reminders.filter((r) => r.status === "Pending" || r.status === "Overdue").length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Module F5 Integrated
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Follow-up Reminders & Recalls
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Post-procedure recalls, chronic review scheduling, and diagnostic repeat notices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/hospital-admin/follow-ups">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                Follow-up Desk
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleBatch}
              className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Dispatch pending ({pendingCount})
            </Button>
          </div>
        </div>
      </div>

      <CommunicationNav unreadChatCount={3} activeBroadcastCount={1} pendingRemindersCount={pendingCount} />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Recalls
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <BellRing className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{reminders.length}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">Sourced from F5 follow-up roster</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending / Overdue
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                <AlertCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{pendingCount}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">Ready for WhatsApp / SMS dispatch</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Patient Confirmed
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">
                {reminders.filter((r) => r.status === "Confirmed").length}
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground">Reply-to-confirm captured</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Compliance
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">87.4%</span>
              <p className="mt-1 text-[11px] text-muted-foreground">Re-booked within 14 days of discharge</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-amber-600" />
                  Follow-up Recall Tracker
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated recalls generated from discharge summaries and clinic due dates.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search patient, doctor, recall..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="Recall type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All types</SelectItem>
                    <SelectItem value="PostOp" className="text-xs">Post-op</SelectItem>
                    <SelectItem value="ChronicReview" className="text-xs">Chronic review</SelectItem>
                    <SelectItem value="DiagnosticRepeat" className="text-xs">Diagnostic repeat</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All statuses</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="sent" className="text-xs">Sent</SelectItem>
                    <SelectItem value="confirmed" className="text-xs">Confirmed</SelectItem>
                    <SelectItem value="overdue" className="text-xs">Overdue</SelectItem>
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
                    <th className="px-4 py-3">Patient / UHID</th>
                    <th className="px-4 py-3">Recall</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                        No follow-up reminders match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{item.patientName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {item.patientUhid} • {item.patientPhone}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{item.procedureOrCondition}</div>
                          <div className="mt-1">
                            {item.recallType === "PostOp" && (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                                Post-op
                              </Badge>
                            )}
                            {item.recallType === "ChronicReview" && (
                              <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-500/30 bg-indigo-500/10">
                                Chronic review
                              </Badge>
                            )}
                            {item.recallType === "DiagnosticRepeat" && (
                              <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30 bg-purple-500/10">
                                Diagnostic repeat
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{item.doctorName}</div>
                          <div className="text-[11px] text-muted-foreground">{item.department}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">{item.dueDate}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-medium">
                            {item.channel === "WhatsApp" ? (
                              <Radio className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            <span>{item.channel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.status === "Confirmed" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                              Confirmed
                            </Badge>
                          )}
                          {item.status === "Sent" && (
                            <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px]">
                              Sent
                            </Badge>
                          )}
                          {item.status === "Pending" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">
                              Pending
                            </Badge>
                          )}
                          {item.status === "Overdue" && (
                            <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.status === "Pending" || item.status === "Overdue" ? (
                            <Button
                              size="sm"
                              onClick={() => handleSend(item.id)}
                              className="h-7 text-[11px] gap-1 px-2"
                            >
                              <Send className="h-3 w-3" />
                              Send now
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono">{item.scheduledFor}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
