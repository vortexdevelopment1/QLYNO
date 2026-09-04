"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Send,
  Radio,
  Smartphone,
  Search,
  CheckCircle2,
  Clock,
  User,
  Plus,
  RefreshCw,
  Bell,
  Calendar,
  Sparkles,
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
import { SendAppointmentMessageModal } from "@/hospital-admin/components/care-coordination/communication/SendAppointmentMessageModal";
import { mockAppointmentMessages } from "@/hospital-admin/lib/mock-data/communication-hub";
import { AppointmentMessageRecord } from "@/hospital-admin/lib/types";

export default function AppointmentMessagesPage() {
  const [messages, setMessages] = useState<AppointmentMessageRecord[]>(mockAppointmentMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerFilter, setTriggerFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [isSendOpen, setIsSendOpen] = useState(false);

  const handleMessageSent = (newRecord: AppointmentMessageRecord) => {
    setMessages([newRecord, ...messages]);
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.patientUhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTrigger =
      triggerFilter === "all" || msg.triggerType === triggerFilter;
    const matchesChannel =
      channelFilter === "all" || msg.channel.toLowerCase() === channelFilter.toLowerCase();

    return matchesSearch && matchesTrigger && matchesChannel;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Module F1 Integrated
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Appointment Notification & Reminder Queue
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Automated trigger pipeline for OPD booking confirmations, 24h & 2h pre-consultation reminders, and rescheduling alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/hospital-admin/appointments">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Go to OPD Appointments
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => setIsSendOpen(true)}
              className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Manual Send Trigger
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

      <div className="flex-1 space-y-6 p-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirmed Bookings Sent
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CalendarCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">342</span>
                <span className="text-xs text-emerald-600 font-medium">100% Sent</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Triggered instantly upon F1 registration
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                24-Hour Pre-Visit Reminders
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">189</span>
                <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-500/30">
                  98.1% Read
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Includes fasting / prep instructions
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                2-Hour Token Recalls
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Bell className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">78</span>
                <span className="text-xs text-muted-foreground">Queue tracking</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Real-time doctor queue token estimates
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                No-Show Reduction Impact
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                <Sparkles className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">-42.8%</span>
                <Badge variant="outline" className="text-[10px] text-teal-600 border-teal-500/30 bg-teal-500/10">
                  Optimal
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Drop in appointment no-show rates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Messages Table */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-indigo-600" />
                  Appointment Dispatches & Automated Pipeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Review all notification dispatches across appointment lifecycle stages.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search patient, doctor, UHID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <Select value={triggerFilter} onValueChange={setTriggerFilter}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="Trigger Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Triggers</SelectItem>
                    <SelectItem value="booking_confirmation" className="text-xs">Booking Confirm</SelectItem>
                    <SelectItem value="reminder_24h" className="text-xs">24h Reminder</SelectItem>
                    <SelectItem value="reminder_2h" className="text-xs">2h Reminder</SelectItem>
                    <SelectItem value="rescheduled" className="text-xs">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Channels</SelectItem>
                    <SelectItem value="whatsapp" className="text-xs">WhatsApp</SelectItem>
                    <SelectItem value="sms" className="text-xs">SMS</SelectItem>
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
                    <th className="px-4 py-3">Doctor & Specialty</th>
                    <th className="px-4 py-3">Slot Time</th>
                    <th className="px-4 py-3">Trigger Stage</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Dispatched At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{msg.patientName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {msg.patientUhid} • {msg.patientPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{msg.doctorName}</div>
                        <div className="text-[11px] text-muted-foreground">{msg.department}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {msg.appointmentTime}
                      </td>
                      <td className="px-4 py-3">
                        {msg.triggerType === "booking_confirmation" && (
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                            Booking Confirmed
                          </Badge>
                        )}
                        {msg.triggerType === "reminder_24h" && (
                          <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-500/30 bg-indigo-500/10">
                            24h Pre-Visit
                          </Badge>
                        )}
                        {msg.triggerType === "reminder_2h" && (
                          <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30 bg-blue-500/10">
                            2h Token Alert
                          </Badge>
                        )}
                        {(msg.triggerType === "rescheduled" || msg.triggerType === "reschedule") && (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10">
                            Rescheduled Notice
                          </Badge>
                        )}
                        {msg.triggerType === "cancellation" && (
                          <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-500/30 bg-rose-500/10">
                            Cancelled Notice
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-medium">
                          {msg.channel === "WhatsApp" ? (
                            <Radio className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                          )}
                          <span>{msg.channel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {msg.status === "Read" && (
                          <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px]">
                            Read
                          </Badge>
                        )}
                        {msg.status === "Delivered" && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                            Delivered
                          </Badge>
                        )}
                        {msg.status === "Sent" && (
                          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">
                            Sent
                          </Badge>
                        )}
                        {msg.status === "Scheduled" && (
                          <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px]">
                            Scheduled
                          </Badge>
                        )}
                        {msg.status === "Failed" && (
                          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                        {msg.dispatchedAt || msg.scheduledFor || msg.sentAt || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <SendAppointmentMessageModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
