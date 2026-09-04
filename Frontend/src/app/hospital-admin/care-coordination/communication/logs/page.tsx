"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Smartphone,
  Filter,
  Download,
  Eye,
  ShieldCheck,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { CommunicationNav } from "@/hospital-admin/components/care-coordination/communication/communication-nav";
import { mockUnifiedDeliveryLogs } from "@/hospital-admin/lib/mock-data/communication-hub";
import { DeliveryAuditLog } from "@/hospital-admin/lib/types";

export default function CommunicationLogsPage() {
  const [logs, setLogs] = useState<DeliveryAuditLog[]>(mockUnifiedDeliveryLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<DeliveryAuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const content = (log.contentSnippet || log.messageSummary || "").toLowerCase();
    const source = (log.triggerSource || log.sourceModule || "").toLowerCase();
    const status = (log.status || log.deliveryStatus || "").toLowerCase();
    const channel = (log.channel || "").toLowerCase();

    const matchesSearch =
      log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipientContact.includes(searchTerm) ||
      content.includes(searchTerm.toLowerCase()) ||
      source.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || status === statusFilter.toLowerCase();
    const matchesChannel =
      channelFilter === "all" || channel === channelFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesChannel;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-500/10 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Audit & Compliance
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Communication Delivery Logs & Analytics
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Immutable audit trail of SMS, WhatsApp, and In-App dispatches with carrier delivery status & latency metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const json = JSON.stringify(logs, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `communication-logs-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Audit Trail (JSON)
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
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Dispatches (24h)
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">1,842</span>
                <span className="text-xs text-emerald-600 font-medium">+8% volume</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Across SMS, WhatsApp, and Push
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Delivery Success Rate
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">99.1%</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                  Carrier Grade
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                0.9% bounced / undeliverable numbers
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Read / Engagement Rate
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Eye className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">94.6%</span>
                <span className="text-xs text-indigo-600 font-medium">WhatsApp high</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Avg read time: 3.2 minutes
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Avg Gateway Latency
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">420ms</span>
                <span className="text-xs text-purple-600 font-medium">Ultra fast</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Twilio / Meta WhatsApp Cloud API
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Real-Time Gateway Transaction Trail
                </CardTitle>
                <CardDescription className="text-xs">
                  Inspect raw message payloads, recipient contact details, delivery receipts, and error codes.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search recipient, source, content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

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

                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Channels</SelectItem>
                    <SelectItem value="whatsapp" className="text-xs">WhatsApp</SelectItem>
                    <SelectItem value="sms" className="text-xs">SMS</SelectItem>
                    <SelectItem value="in-app" className="text-xs">In-App Push</SelectItem>
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
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Source Trigger</th>
                    <th className="px-4 py-3">Content Snippet</th>
                    <th className="px-4 py-3">Carrier Status</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{log.recipientName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {log.recipientContact}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-medium">
                          {log.channel === "WhatsApp" ? (
                            <Radio className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                          )}
                          <span>{log.channel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {log.triggerSource || log.sourceModule || "General"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">
                        {log.contentSnippet || log.messageSummary || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {(log.status === "Read" || log.deliveryStatus === "Read") && (
                          <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px]">
                            Read
                          </Badge>
                        )}
                        {(log.status === "Delivered" || log.deliveryStatus === "Delivered") && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                            Delivered
                          </Badge>
                        )}
                        {(log.status === "Sent" || log.deliveryStatus === "Sent") && (
                          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">
                            Sent
                          </Badge>
                        )}
                        {(log.status === "Failed" || log.deliveryStatus === "Failed") && (
                          <Badge variant="destructive" className="text-[10px]">
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Payload Inspection Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Message Delivery Receipt & Payload
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Log ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Recipient</span>
                  <span className="font-semibold">{selectedLog.recipientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-mono">{selectedLog.recipientContact}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Channel</span>
                  <span className="font-medium">{selectedLog.channel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Trigger Source</span>
                  <span className="font-mono">{selectedLog.triggerSource || selectedLog.sourceModule}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dispatch Timestamp</span>
                  <span className="font-mono">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Delivery Status</span>
                  <span className="font-semibold text-emerald-600">{selectedLog.status || selectedLog.deliveryStatus}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground mb-1 block">
                  Dispatched Text Content
                </label>
                <div className="p-3 bg-muted/50 rounded border border-border text-foreground font-sans leading-relaxed">
                  {selectedLog.contentSnippet || selectedLog.messageSummary || "-"}
                </div>
              </div>

              {selectedLog.failureReason && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-600 text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Gateway Error Reason:
                  </div>
                  <p className="mt-1">{selectedLog.failureReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
