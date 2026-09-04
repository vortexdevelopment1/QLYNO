"use client";

import { useState } from "react";
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Zap,
  Server,
  ShieldCheck,
  Search,
  MessageSquare,
  Activity,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { CommunicationNav } from "@/hospital-admin/components/care-coordination/communication/communication-nav";
import { SendAppointmentMessageModal } from "@/hospital-admin/components/care-coordination/communication/SendAppointmentMessageModal";
import {
  mockWhatsAppGatewayMetrics,
  mockWhatsAppMessageLogs,
} from "@/hospital-admin/lib/mock-data/communication-hub";
import { WhatsAppAuditLogItem, AppointmentMessageRecord } from "@/hospital-admin/lib/types";

export default function WhatsAppGatewayPage() {
  const [metrics, setMetrics] = useState(mockWhatsAppGatewayMetrics);
  const [logs, setLogs] = useState<WhatsAppAuditLogItem[]>(mockWhatsAppMessageLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleMessageSent = (record: AppointmentMessageRecord) => {
    const newLog: WhatsAppAuditLogItem = {
      id: `wlg-${Date.now()}`,
      messageId: `wamid.HB_${Math.random().toString(36).substring(2, 10)}`,
      recipientPhone: record.patientPhone,
      recipientName: record.patientName,
      moduleSource: "F1 Appointments",
      templateUsed: record.templateId,
      templateName: record.templateName,
      contentSnippet: `${record.templateName} for ${record.doctorName} (${record.department})`,
      category: "UTILITY",
      status: "Delivered",
      timestamp: "Just now",
      dispatchedAt: "Just now",
      deliveredAt: "Just now",
    };
    setLogs([newLog, ...logs]);
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipientPhone.includes(searchTerm) ||
      (log.templateName || log.templateUsed || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Official Business API
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                WhatsApp Business Gateway Telemetry
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Meta Cloud API Gateway telemetry, webhook endpoint diagnostics, rate limits, and live dispatch logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 text-xs gap-1.5"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Gateway
            </Button>
            <Button
              size="sm"
              onClick={() => setIsSendOpen(true)}
              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              Dispatch Template Test
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
        {/* Gateway Telemetry Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gateway Health Status
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Radio className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{metrics.status}</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                  v19.0 API
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground font-mono">
                Phone: {metrics.phoneNumber}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Daily Quota & Consumption
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Zap className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {metrics.dailySentCount?.toLocaleString("en-US") || "1,845"}
                </span>
                <span className="text-xs text-muted-foreground">/ {metrics.dailyLimit?.toLocaleString("en-US") || "100,000"}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Tier 2: 100k messages / 24 hrs
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Delivery Success Rate
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{metrics.deliveryRate}%</span>
                <Badge variant="outline" className="text-[10px] text-teal-600 border-teal-500/30 bg-teal-500/10">
                  Read {metrics.readRate}%
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                0.6% Failed (Network / Unregistered)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Webhook Latency
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <Activity className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{metrics.averageLatencyMs} ms</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                  HTTPS 200 OK
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Last ping: {metrics.lastPing}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Logs Table */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-600" />
                  Meta Webhook Dispatch Audit Log
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time webhook events, message IDs (wamid), delivered and read receipt acknowledgments.
                </CardDescription>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search phone, recipient, template..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">WAMID / Identifier</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Template Name</th>
                    <th className="px-4 py-3">Meta Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Dispatched</th>
                    <th className="px-4 py-3 text-right">Read At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {log.messageId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{log.recipientName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {log.recipientPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {log.templateName}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">
                          {log.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {log.status === "Read" && (
                          <div className="flex items-center gap-1 text-blue-600 font-medium">
                            <CheckCheck className="h-3.5 w-3.5" />
                            <span>Read</span>
                          </div>
                        )}
                        {log.status === "Delivered" && (
                          <div className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCheck className="h-3.5 w-3.5" />
                            <span>Delivered</span>
                          </div>
                        )}
                        {log.status === "Sent" && (
                          <div className="flex items-center gap-1 text-amber-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Sent</span>
                          </div>
                        )}
                        {log.status === "Failed" && (
                          <div className="flex items-center gap-1 text-rose-600 font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Failed ({log.failureReason})</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground text-[11px]">
                        {log.dispatchedAt}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground text-[11px]">
                        {log.readAt || "—"}
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
