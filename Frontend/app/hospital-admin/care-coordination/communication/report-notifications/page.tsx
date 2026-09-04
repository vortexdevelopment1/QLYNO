"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Radio,
  Smartphone,
  Search,
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  Send,
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
import { mockReportNotifications } from "@/hospital-admin/lib/mock-data/communication-hub";
import { ReportNotificationRecord } from "@/hospital-admin/lib/types";

export default function ReportNotificationsPage() {
  const [notifications, setNotifications] = useState<ReportNotificationRecord[]>(mockReportNotifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleDispatch = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id && item.status === "Scheduled"
          ? { ...item, status: "Delivered", dispatchedAt: "Just now" }
          : item
      )
    );
  };

  const filtered = notifications.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientUhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reportId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = kindFilter === "all" || item.kind === kindFilter;
    const matchesStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesKind && matchesStatus;
  });

  const criticalCount = notifications.filter((n) => n.isCritical).length;
  const pendingCount = notifications.filter((n) => n.status === "Scheduled").length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                Module F22 Integrated
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Diagnostic Report Notifications
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Lab and radiology sign-off alerts, encrypted portal links, and panic-value escalations.
            </p>
          </div>
          <Link href="/hospital-admin/care-coordination/reports-review">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-primary" />
              Open Reports Review
            </Button>
          </Link>
        </div>
      </div>

      <CommunicationNav unreadChatCount={3} activeBroadcastCount={1} pendingRemindersCount={8} />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dispatched Today
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{notifications.length}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">F13 / F14 / F22 sign-off pipeline</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Panic Value Escalations
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{criticalCount}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">SMS / phone read-back required</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Dispatch
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Send className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{pendingCount}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">Awaiting patient notify trigger</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Read Rate
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Radio className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">88%</span>
              <p className="mt-1 text-[11px] text-muted-foreground">WhatsApp report-ready notices</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-teal-600" />
                  Report Notification Queue
                </CardTitle>
                <CardDescription className="text-xs">
                  Sign-off notices and critical value alerts dispatched after consultant review.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search patient, UHID, test..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Select value={kindFilter} onValueChange={setKindFilter}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="Kind" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All kinds</SelectItem>
                    <SelectItem value="sign_off" className="text-xs">Sign-off</SelectItem>
                    <SelectItem value="panic_value" className="text-xs">Panic value</SelectItem>
                    <SelectItem value="portal_ready" className="text-xs">Portal ready</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All statuses</SelectItem>
                    <SelectItem value="scheduled" className="text-xs">Scheduled</SelectItem>
                    <SelectItem value="delivered" className="text-xs">Delivered</SelectItem>
                    <SelectItem value="read" className="text-xs">Read</SelectItem>
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
                    <th className="px-4 py-3">Patient / UHID</th>
                    <th className="px-4 py-3">Test / Report</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Kind</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Dispatched</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                        No report notifications match your filters.
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
                          <div className="font-medium text-foreground">{item.testName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{item.reportId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">{item.sourceModule}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {item.kind === "panic_value" ? (
                            <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
                              Panic value
                            </Badge>
                          ) : item.kind === "portal_ready" ? (
                            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30 bg-blue-500/10">
                              Portal ready
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-teal-600 border-teal-500/30 bg-teal-500/10">
                              Sign-off
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-medium">
                            {item.channel === "WhatsApp" && <Radio className="h-3.5 w-3.5 text-emerald-500" />}
                            {item.channel === "SMS" && <Smartphone className="h-3.5 w-3.5 text-blue-500" />}
                            {item.channel === "Portal" && <MessageSquare className="h-3.5 w-3.5 text-purple-500" />}
                            {item.channel === "Phone Call" && <PhoneCall className="h-3.5 w-3.5 text-amber-500" />}
                            <span>{item.channel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.status === "Scheduled" ? (
                            <Button
                              size="sm"
                              onClick={() => handleDispatch(item.id)}
                              className="h-7 text-[11px] gap-1 px-2"
                            >
                              <Send className="h-3 w-3" />
                              Notify now
                            </Button>
                          ) : (
                            <Badge
                              className={
                                item.status === "Read"
                                  ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px]"
                                  : item.status === "Failed"
                                    ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]"
                                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]"
                              }
                            >
                              {item.status}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                          {item.dispatchedAt}
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
