"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radio,
  MessageSquare,
  CalendarCheck,
  FileCheck2,
  BellRing,
  FileText,
  Megaphone,
  BookTemplate,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  TrendingUp,
  Activity,
  PhoneCall,
  Smartphone,
  ExternalLink,
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
import { ComposeBroadcastModal } from "@/hospital-admin/components/care-coordination/communication/ComposeBroadcastModal";
import { CreateTemplateModal } from "@/hospital-admin/components/care-coordination/communication/CreateTemplateModal";
import { AddDoctorNoteModal } from "@/hospital-admin/components/care-coordination/communication/AddDoctorNoteModal";
import { SendAppointmentMessageModal } from "@/hospital-admin/components/care-coordination/communication/SendAppointmentMessageModal";
import {
  mockUnifiedDeliveryLogs,
  mockWhatsAppGatewayMetrics,
  mockPatientChatThreads,
  mockBroadcastRecords,
} from "@/hospital-admin/lib/mock-data/communication-hub";
import { UnifiedDeliveryLogItem, BroadcastRecord, MessageTemplate, ClinicalNote, AppointmentMessageRecord } from "@/hospital-admin/lib/types";

export default function CommunicationHubOverviewPage() {
  const [logs, setLogs] = useState<UnifiedDeliveryLogItem[]>(mockUnifiedDeliveryLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isDoctorNoteOpen, setIsDoctorNoteOpen] = useState(false);
  const [isAppointmentMsgOpen, setIsAppointmentMsgOpen] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.sourceModule || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.messageSummary || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.recipientUhid && log.recipientUhid.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesChannel =
      channelFilter === "all" || (log.channel || "").toLowerCase() === channelFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" || (log.deliveryStatus || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const handleBroadcastCreated = (newBcast: BroadcastRecord) => {
    // Add to unified delivery logs
    const newLogItem: UnifiedDeliveryLogItem = {
      id: `udl-${Date.now()}`,
      sourceModule: newBcast.type === "Code Blue" ? "F3 Emergency" : "Hospital Operations",
      recipientName: `${newBcast.targetScope} (${newBcast.targetAudienceSize} Staff)`,
      recipientContact: newBcast.channels.join(", "),
      channel: "Broadcast",
      templateUsed: "TPL-EMG-CODE-BLUE",
      messageSummary: newBcast.title,
      deliveryStatus: "Delivered",
      timestamp: "Just now",
    };
    setLogs([newLogItem, ...logs]);
  };

  const handleAppointmentSent = (rec: AppointmentMessageRecord) => {
    const newLogItem: UnifiedDeliveryLogItem = {
      id: `udl-${Date.now()}`,
      sourceModule: "F1 Appointments",
      recipientName: rec.patientName,
      recipientUhid: rec.patientUhid,
      recipientContact: rec.patientPhone,
      channel: rec.channel,
      templateUsed: rec.templateId,
      messageSummary: `${rec.triggerType.replace("_", " ").toUpperCase()}: ${rec.department} with ${rec.doctorName}`,
      deliveryStatus: "Delivered",
      timestamp: "Just now",
    };
    setLogs([newLogItem, ...logs]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Module F23
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Communication Hub & Multi-Channel Gateway
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Single pane of glass for WhatsApp, SMS, Portal Chat, Code Blue PA broadcasts, and clinical handoff notes.
            </p>
          </div>

          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDoctorNoteOpen(true)}
              className="h-8 shrink-0 text-xs gap-1.5 whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              Log Doctor Note
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAppointmentMsgOpen(true)}
              className="h-8 shrink-0 text-xs gap-1.5 whitespace-nowrap"
            >
              <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
              Send Appointment Message
            </Button>
            <Button
              size="sm"
              onClick={() => setIsBroadcastOpen(true)}
              className="h-8 shrink-0 text-xs gap-1.5 whitespace-nowrap bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Megaphone className="h-3.5 w-3.5" />
              Trigger Broadcast
            </Button>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <CommunicationNav
        unreadChatCount={3}
        activeBroadcastCount={1}
        pendingRemindersCount={8}
      />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                WhatsApp Gateway Delivery
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Radio className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">99.4%</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                  Healthy
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                1,845 dispatched today • Latency 340ms
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Patient Portal Threads
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MessageSquare className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">4 Active</span>
                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30 bg-blue-500/10">
                  3 Unread
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Cardiology, Orthopaedics, General Medicine
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Diagnostic & Follow-up Recalls
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <BellRing className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">18 Dispatched</span>
                <span className="text-xs text-muted-foreground font-medium">96% Confirmed</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Automated F1/F5/F22 cross-module triggers
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hospital Broadcasts
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Megaphone className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">1 Code Blue</span>
                <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-500/30 bg-rose-500/10 animate-pulse">
                  Active
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                28 / 32 Responders acknowledged (87.5%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Route Cards */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Communication Hub Workspaces</h2>
            <span className="text-xs text-muted-foreground">8 Specialized Sub-Modules</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/hospital-admin/care-coordination/communication/patient-chat"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">Portal</Badge>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Patient Portal Chat
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  2-way secure patient messaging, clinical queries, wound photo review, and scheduling assistance.
                </p>
              </div>
            </Link>

            <Link
              href="/hospital-admin/care-coordination/communication/whatsapp"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Radio className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">Gateway</Badge>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  WhatsApp Business API
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Live throughput monitoring, webhook health, message read receipts, and delivery failover.
                </p>
              </div>
            </Link>

            <Link
              href="/hospital-admin/care-coordination/communication/appointment-messages"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">F1 Sourced</Badge>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Appointment Messages
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  OPD booking confirmations, 24h & 2h pre-visit reminders, and instant rescheduling notices.
                </p>
              </div>
            </Link>

            <Link
              href="/hospital-admin/care-coordination/communication/report-notifications"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">F22 Sourced</Badge>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Report Notifications
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Diagnostic lab/radiology sign-off alerts with encrypted download links & panic value escalations.
                </p>
              </div>
            </Link>

            <Link
              href="/hospital-admin/care-coordination/communication/follow-up-reminders"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <BellRing className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">F5 Sourced</Badge>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Follow-up Reminders
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Post-procedure recalls, chronic disease review scheduling, and patient compliance tracking.
                </p>
              </div>
            </Link>

            <Link
              href="/hospital-admin/care-coordination/communication/doctor-notes"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">Clinical</Badge>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Doctor Notes & Handoffs
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Multidisciplinary care team notes, shift handovers, and role-restricted clinical instructions.
                </p>
              </div>
            </Link>

            <Link
              href="/hospital-admin/care-coordination/communication/broadcasts"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Megaphone className="h-5 w-5" />
                </div>
                <Badge variant="destructive" className="text-[10px]">Emergency</Badge>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Hospital Broadcasts
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Emergency Code Blue alerts, facility maintenance bulletins, and hospital-wide PA notifications.
                </p>
              </div>
            </Link>

            <Link
              href="/hospital-admin/care-coordination/communication/templates"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                  <BookTemplate className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">Library</Badge>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Shared Templates Library
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Standardized multi-channel message templates with token substitution and NABH audit approval.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Unified Cross-Module Delivery Audit Log */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Unified Cross-Module Delivery Audit Log
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time immutable audit trail of all messages dispatched across Appointments, Reports, Recalls, and Emergency Broadcasts.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search recipient, UHID, module..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Channels</SelectItem>
                    <SelectItem value="whatsapp" className="text-xs">WhatsApp</SelectItem>
                    <SelectItem value="sms" className="text-xs">SMS</SelectItem>
                    <SelectItem value="broadcast" className="text-xs">Broadcast</SelectItem>
                    <SelectItem value="portal" className="text-xs">Portal</SelectItem>
                    <SelectItem value="phone call" className="text-xs">Phone Call</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="read" className="text-xs">Read</SelectItem>
                    <SelectItem value="delivered" className="text-xs">Delivered</SelectItem>
                    <SelectItem value="sent" className="text-xs">Sent</SelectItem>
                    <SelectItem value="failed" className="text-xs">Failed</SelectItem>
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
                    <th className="px-4 py-3">Source Module</th>
                    <th className="px-4 py-3">Recipient / UHID</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Template</th>
                    <th className="px-4 py-3">Message Summary</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                        No delivery logs match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {log.sourceModule}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{log.recipientName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {log.recipientUhid || log.recipientContact}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {log.channel === "WhatsApp" && <Radio className="h-3.5 w-3.5 text-emerald-500" />}
                            {log.channel === "SMS" && <Smartphone className="h-3.5 w-3.5 text-blue-500" />}
                            {log.channel === "Broadcast" && <Megaphone className="h-3.5 w-3.5 text-rose-500" />}
                            {log.channel === "Portal" && <MessageSquare className="h-3.5 w-3.5 text-purple-500" />}
                            {log.channel === "Phone Call" && <PhoneCall className="h-3.5 w-3.5 text-amber-500" />}
                            <span className="font-medium">{log.channel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {log.templateUsed || "Custom"}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">
                          {log.messageSummary}
                        </td>
                        <td className="px-4 py-3">
                          {log.deliveryStatus === "Read" && (
                            <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px]">
                              Read
                            </Badge>
                          )}
                          {log.deliveryStatus === "Delivered" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                              Delivered
                            </Badge>
                          )}
                          {log.deliveryStatus === "Sent" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">
                              Sent
                            </Badge>
                          )}
                          {log.deliveryStatus === "Failed" && (
                            <Badge variant="destructive" className="text-[10px]">
                              Failed
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground font-mono text-[11px]">
                          {log.timestamp}
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

      {/* Modals */}
      <ComposeBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onBroadcastCreated={handleBroadcastCreated}
      />
      <CreateTemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onTemplateCreated={() => {}}
      />
      <AddDoctorNoteModal
        isOpen={isDoctorNoteOpen}
        onClose={() => setIsDoctorNoteOpen(false)}
        onNoteCreated={() => {}}
      />
      <SendAppointmentMessageModal
        isOpen={isAppointmentMsgOpen}
        onClose={() => setIsAppointmentMsgOpen(false)}
        onMessageSent={handleAppointmentSent}
      />
    </div>
  );
}
