"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Gauge,
  HelpCircle,
  Layers,
  Mail,
  MessageSquare,
  MessageSquareCode,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
  Zap,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import {
  mockExtendedNotifications,
  mockNotificationRules,
  mockEscalationLadders,
  mockEscalationRecords,
} from "@/hospital-admin/lib/mock-data/notifications-extended";
import {
  HospitalNotification,
  NotificationEventRule,
  EscalationLadder,
  EscalationRecord,
  HospitalNotificationCategory,
  NotificationSeverity,
  NotificationStatus,
  NotificationChannel,
  HospitalNotificationEventType,
} from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { cn, formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Notification & Escalation Center";

const CATEGORIES: Array<{ id: string; label: string; icon: any }> = [
  { id: "all", label: "All Alerts", icon: Layers },
  { id: "Emergency", label: "Emergency SOS", icon: Flame },
  { id: "Staffing", label: "Staffing Gaps", icon: Users },
  { id: "Operational", label: "Operational & Beds", icon: Building2 },
  { id: "Security", label: "Security & Safety", icon: ShieldAlert },
  { id: "Clinical", label: "Clinical & Labs", icon: Stethoscope },
  { id: "Vendor", label: "Vendors & Supply", icon: Zap },
  { id: "Appointments", label: "Appointments", icon: CalendarClock },
];

export default function NotificationsEscalationPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"feed" | "routing" | "ladders" | "history">("feed");

  // State Stores
  const [notifications, setNotifications] = useState<HospitalNotification[]>(mockExtendedNotifications);
  const [rules, setRules] = useState<NotificationEventRule[]>(mockNotificationRules);
  const [ladders, setLadders] = useState<EscalationLadder[]>(mockEscalationLadders);
  const [records, setRecords] = useState<EscalationRecord[]>(mockEscalationRecords);

  // Tab 1 Filters
  const [feedScope, setFeedScope] = useState<"admin-only" | "all-events">("admin-only");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Escalation Ladder Builder Modal State
  const [newLadderModalOpen, setNewLadderModalOpen] = useState(false);
  const [ladderName, setLadderName] = useState("");
  const [ladderEventType, setLadderEventType] = useState<HospitalNotificationEventType>("Emergency SOS");
  const [ladderDepartment, setLadderDepartment] = useState("Emergency & Critical Care");
  const [ladderStep1Role, setLadderStep1Role] = useState("On-Duty Resident");
  const [ladderStep1Minutes, setLadderStep1Minutes] = useState(0);
  const [ladderStep2Role, setLadderStep2Role] = useState("Senior Department Specialist");
  const [ladderStep2Minutes, setLadderStep2Minutes] = useState(5);
  const [ladderStep3Role, setLadderStep3Role] = useState("Hospital Admin & Medical Superintendent");
  const [ladderStep3Minutes, setLadderStep3Minutes] = useState(15);
  const [ladderFallback, setLadderFallback] = useState("Medical Superintendent (+91 98200 99887)");

  // Incident Resolution Modal State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EscalationRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Timeline Inspection Modal State
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [inspectRecord, setInspectRecord] = useState<EscalationRecord | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Scope filter (Admin Direct vs Hospital-Wide)
      if (feedScope === "admin-only" && !n.adminRecipient) return false;

      // Category filter
      if (categoryFilter !== "all" && n.category !== categoryFilter) return false;

      // Severity filter
      if (severityFilter !== "all" && n.severity !== severityFilter) return false;

      // Status filter
      if (statusFilter !== "all" && n.status !== statusFilter) return false;

      // Keyword search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.eventType.toLowerCase().includes(q) ||
          (n.sourceDepartment && n.sourceDepartment.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [notifications, feedScope, categoryFilter, severityFilter, statusFilter, search]);

  // KPI Calculations
  const unreadCount = notifications.filter((n) => n.status === "Unread").length;
  const criticalCount = notifications.filter((n) => n.severity === "critical" && n.status !== "Dismissed").length;
  const activeEscalationsCount = records.filter((r) => r.status === "In Progress" || r.status === "Escalated").length;
  const resolvedCount = records.filter((r) => r.status === "Resolved").length;

  // Actions on Notifications
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: n.status === "Unread" ? "Read" : n.status })));
    toast({
      title: "All Notifications Marked as Read",
      description: `Updated notification inbox. (${DELEGATION_STRING})`,
    });
  };

  const handleAcknowledgeNotification = (id: string) => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status: "Acknowledged",
              acknowledgedBy: "Hospital Admin",
              acknowledgedAt: now,
            }
          : n
      )
    );
    toast({
      title: "Notification Acknowledged",
      description: `Alert marked as acknowledged by Hospital Admin. (${DELEGATION_STRING})`,
    });
  };

  const handleToggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, status: n.status === "Unread" ? "Read" : "Unread" }
          : n
      )
    );
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "Dismissed" } : n))
    );
    toast({
      title: "Notification Dismissed",
      description: "Alert removed from active view.",
    });
  };

  const handleTriggerManualEscalation = (notification: HospitalNotification) => {
    const nextLevel = notification.escalationLevel === "L1" ? "L2" : "L3";
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, escalationLevel: nextLevel } : n
      )
    );

    // Also record an incident
    const newRecord: EscalationRecord = {
      id: `esc_${Date.now()}`,
      incidentCode: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      eventType: notification.eventType,
      title: notification.title,
      department: notification.sourceDepartment || "Hospital Operations",
      triggeredAt: new Date().toISOString(),
      currentStep: nextLevel,
      stepsTaken: [
        {
          step: `${nextLevel}: Manual Admin Trigger`,
          notifiedAt: new Date().toISOString(),
          recipient: "Escalation Response Group",
          channel: "sms",
          status: "Delivered",
        },
      ],
      status: "Escalated",
      durationMinutes: 1,
    };

    setRecords((prev) => [newRecord, ...prev]);

    toast({
      title: `Escalated to ${nextLevel}`,
      description: `Alert for ${notification.title} escalated to ${nextLevel} authority. (${DELEGATION_STRING})`,
    });
  };

  // Actions on Routing Rules
  const handleToggleChannel = (ruleId: string, channel: NotificationChannel) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        const exists = r.enabledChannels.includes(channel);
        const updated = exists
          ? r.enabledChannels.filter((c) => c !== channel)
          : [...r.enabledChannels, channel];
        return { ...r, enabledChannels: updated };
      })
    );
    toast({
      title: "Delivery Channel Updated",
      description: `Updated delivery routing for event. (${DELEGATION_STRING})`,
    });
  };

  const handleToggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
    toast({
      title: "Event Routing Updated",
      description: "Notification rule state toggled successfully.",
    });
  };

  // Actions on Ladders
  const handleSaveLadder = (e: React.FormEvent) => {
    e.preventDefault();
    const newLadder: EscalationLadder = {
      id: `lad_${Date.now()}`,
      name: ladderName,
      eventType: ladderEventType,
      department: ladderDepartment,
      enabled: true,
      steps: [
        { level: 1, name: "Initial Response", role: ladderStep1Role, thresholdMinutes: ladderStep1Minutes, channel: "in-app" },
        { level: 2, name: "Supervisor Escalation", role: ladderStep2Role, thresholdMinutes: ladderStep2Minutes, channel: "sms" },
        { level: 3, name: "Executive Escalation", role: ladderStep3Role, thresholdMinutes: ladderStep3Minutes, channel: "whatsapp" },
      ],
      fallbackRecipient: ladderFallback,
      autoResolveOnAction: true,
    };

    setLadders((prev) => [...prev, newLadder]);
    toast({
      title: "Escalation Ladder Created",
      description: `${ladderName} configured with 3-tier time thresholds. (${DELEGATION_STRING})`,
    });
    setNewLadderModalOpen(false);
    setLadderName("");
  };

  // Actions on Escalation Records
  const handleOpenResolveModal = (record: EscalationRecord) => {
    setSelectedRecord(record);
    setResolutionNotes("");
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const now = new Date().toISOString();
    setRecords((prev) =>
      prev.map((r) =>
        r.id === selectedRecord.id
          ? {
              ...r,
              status: "Resolved",
              resolvedAt: now,
              resolvedBy: "Hospital Admin (Acting Incharge)",
              resolutionNotes,
            }
          : r
      )
    );

    toast({
      title: "Incident Resolved & Closed",
      description: `${selectedRecord.incidentCode} marked as resolved with audit justification. (${DELEGATION_STRING})`,
    });
    setResolveModalOpen(false);
    setSelectedRecord(null);
  };

  const handleOpenTimeline = (record: EscalationRecord) => {
    setInspectRecord(record);
    setTimelineModalOpen(true);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Notification &amp; Escalation Center"
          description="Centralized event routing engine, hospital-wide alert streams, multi-tier escalation ladders, and resolution audits."
          crumbs={[{ label: "Administration" }, { label: "Notifications" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading notification engine...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="Notification &amp; Escalation Center"
        description="Centralized event routing engine, hospital-wide alert streams, multi-tier escalation ladders, and resolution audits."
        crumbs={[{ label: "Administration" }, { label: "Notifications" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5 text-primary" /> Mark All as Read
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
              onClick={() => setNewLadderModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> + New Escalation Ladder
            </Button>
          </div>
        }
      />

      {/* Scope Indicator & Delegation Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Alert Dispatch &amp; Escalation Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>PRD Section 16 Engine • Event-to-recipient routing &amp; automated multi-tier escalation tracking</span>
        </div>
      </div>

      {/* Executive KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Unread Alerts</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{unreadCount} Alerts</p>
          <span className="text-[10px] text-muted-foreground">Across active modules</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-rose-600" /> Critical Emergency
          </span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{criticalCount} Critical</p>
          <span className="text-[10px] text-rose-600 font-medium">SOS &amp; Surgery Blockers</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Escalations</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{activeEscalationsCount} In Progress</p>
          <span className="text-[10px] text-amber-600 font-medium">L2/L3 Ladders Active</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Resolved Incidents</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{resolvedCount} Closed</p>
          <span className="text-[10px] text-emerald-600 font-medium">Avg Response: 18.4 mins</span>
        </Card>
      </div>

      {/* 4 Main Consoles */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-2xl">
          <TabsTrigger value="feed" className="text-xs font-semibold flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-primary" /> Live Alerts Feed
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-primary text-primary-foreground font-bold">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="routing" className="text-xs font-semibold flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-cyan-600" /> Event Routing Rules
          </TabsTrigger>
          <TabsTrigger value="ladders" className="text-xs font-semibold flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-600" /> Escalation Ladders
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-semibold flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-emerald-600" /> Incident Log
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB 1: LIVE ALERTS FEED                                        */}
        {/* ============================================================== */}
        <TabsContent value="feed" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" /> Hospital Operational Alerts &amp; Incidents Stream
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Real-time event stream across Emergency, Surgery, Wards, ICU, Staffing, Supply, and Security.
                  </CardDescription>
                </div>

                {/* Scope Segment: Admin Direct Inbox vs All Hospital Events */}
                <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setFeedScope("admin-only")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                      feedScope === "admin-only"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    🛡️ Admin Direct Inbox (7 Events)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedScope("all-events")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                      feedScope === "all-events"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    🌐 All Hospital Events (12 Events)
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
              {/* Category Pills & Filters */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-border/60">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = categoryFilter === cat.id;
                  return (
                    <Button
                      key={cat.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-7 text-xs font-medium gap-1.5",
                        isActive && "bg-primary text-primary-foreground font-semibold"
                      )}
                      onClick={() => setCategoryFilter(cat.id)}
                    >
                      <Icon className="h-3 w-3" />
                      {cat.label}
                    </Button>
                  );
                })}
              </div>

              {/* Search & Dropdowns */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search incident, title, department..."
                    className="pl-8 text-xs h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[130px] text-xs h-9">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="info">🔵 Info / Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] text-xs h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Unread">Unread</SelectItem>
                      <SelectItem value="Read">Read</SelectItem>
                      <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="Dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Feed List */}
              {filteredNotifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No notifications in this filter"
                  description="You are all caught up for the selected criteria and operational scope."
                />
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notif) => {
                    const isCritical = notif.severity === "critical";
                    const isUnread = notif.status === "Unread";

                    return (
                      <Card
                        key={notif.id}
                        className={cn(
                          "border transition-all hover:shadow-xs",
                          isCritical && isUnread
                            ? "border-rose-500/50 bg-rose-500/[0.04] shadow-xs"
                            : isUnread
                            ? "border-primary/40 bg-primary/[0.02]"
                            : "border-border bg-card opacity-90"
                        )}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex items-start gap-3">
                              {/* Severity Icon Indicator */}
                              <div
                                className={cn(
                                  "p-2 rounded-lg shrink-0 mt-0.5",
                                  notif.severity === "critical"
                                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse"
                                    : notif.severity === "high"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    : notif.severity === "medium"
                                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {notif.severity === "critical" ? (
                                  <Flame className="h-4 w-4" />
                                ) : notif.severity === "high" ? (
                                  <AlertTriangle className="h-4 w-4" />
                                ) : (
                                  <Bell className="h-4 w-4" />
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-xs font-bold text-foreground">{notif.title}</span>
                                  {isUnread && (
                                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] px-1.5 py-0 h-4 font-mono font-bold",
                                      notif.severity === "critical"
                                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                                        : notif.severity === "high"
                                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {notif.eventType}
                                  </Badge>

                                  {notif.escalationLevel && (
                                    <Badge className="bg-destructive text-destructive-foreground text-[8px] px-1.5 py-0 h-4 font-mono">
                                      ⚡ {notif.escalationLevel} Escalation
                                    </Badge>
                                  )}

                                  {notif.adminRecipient ? (
                                    <Badge className="bg-primary/15 text-primary border-primary/30 text-[8px] px-1.5 py-0 h-4">
                                      🛡️ Admin Direct
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 text-muted-foreground">
                                      Role Recipient Only
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {notif.message}
                                </p>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground">
                                  {notif.sourceDepartment && (
                                    <span className="flex items-center gap-1">
                                      <Building2 className="h-3 w-3 text-primary" /> {notif.sourceDepartment}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 font-mono">
                                    <Clock className="h-3 w-3" /> {formatDateTime(notif.timestamp)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" /> Targets: {notif.targetRoles.join(", ")}
                                  </span>
                                  {notif.acknowledgedBy && (
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                      <CheckCircle2 className="h-3 w-3" /> Ack: {notif.acknowledgedBy} {notif.acknowledgedAt ? `(${formatDateTime(notif.acknowledgedAt)})` : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="shrink-0 flex items-center gap-2 self-start">
                              <Badge
                                className={cn(
                                  "text-[10px]",
                                  notif.status === "Unread"
                                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                                    : notif.status === "Acknowledged"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                    : notif.status === "Dismissed"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-primary/10 text-primary border-primary/30"
                                )}
                              >
                                {notif.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Quick Action Toolbar */}
                          <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {notif.status !== "Acknowledged" && notif.status !== "Dismissed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30 gap-1"
                                  onClick={() => handleAcknowledgeNotification(notif.id)}
                                >
                                  <Check className="h-3 w-3" /> Acknowledge
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] font-medium gap-1"
                                onClick={() => handleToggleReadStatus(notif.id)}
                              >
                                <Eye className="h-3 w-3" /> {isUnread ? "Mark Read" : "Mark Unread"}
                              </Button>

                              {notif.severity === "critical" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/30 gap-1"
                                  onClick={() => handleTriggerManualEscalation(notif)}
                                >
                                  <Zap className="h-3 w-3" /> Force Escalate
                                </Button>
                              )}

                              {notif.status !== "Dismissed" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                                  onClick={() => handleDismissNotification(notif.id)}
                                >
                                  Dismiss
                                </Button>
                              )}
                            </div>

                            {/* Deep-Link to Target Screen */}
                            {notif.linkUrl && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-[11px] font-semibold bg-primary text-primary-foreground gap-1"
                                asChild
                              >
                                <Link href={notif.linkUrl}>
                                  Open Linked Screen <ExternalLink className="h-3 w-3 ml-0.5" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 2: EVENT ROUTING & CHANNEL CONFIGURATION                   */}
        {/* ============================================================== */}
        <TabsContent value="routing" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-600" /> PRD Section 16 Event-to-Recipient Routing Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                Configure delivery channels (In-App, SMS, Email, WhatsApp) and review direct Admin vs Role-specific recipient distribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[220px]">Event Name &amp; Category</TableHead>
                      <TableHead className="text-xs font-bold w-[260px]">Target Recipient Roles</TableHead>
                      <TableHead className="text-xs font-bold w-[130px]">Admin Direct?</TableHead>
                      <TableHead className="text-xs font-bold w-[200px]">Delivery Channels</TableHead>
                      <TableHead className="text-xs font-bold text-center w-[100px]">Escalation</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[80px]">Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="align-top">
                          <div className="font-semibold text-xs text-foreground">{rule.eventType}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{rule.description}</div>
                          <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 mt-1">
                            {rule.category}
                          </Badge>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="flex flex-wrap gap-1">
                            {rule.defaultRecipients.map((rec, i) => (
                              <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                                {rec}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          {rule.adminDirectRecipient ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
                              ✅ Admin Direct
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] text-muted-foreground">
                              ❌ Department Only
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="flex items-center gap-1.5">
                            {/* In-App Channel */}
                            <button
                              type="button"
                              onClick={() => handleToggleChannel(rule.id, "in-app")}
                              title="Toggle In-App Notification"
                              className={cn(
                                "p-1.5 rounded-md border text-xs transition-all",
                                rule.enabledChannels.includes("in-app")
                                  ? "bg-primary/15 text-primary border-primary/40 font-bold"
                                  : "bg-muted/40 text-muted-foreground/50 border-border"
                              )}
                            >
                              <Bell className="h-3.5 w-3.5" />
                            </button>

                            {/* SMS Channel */}
                            <button
                              type="button"
                              onClick={() => handleToggleChannel(rule.id, "sms")}
                              title="Toggle SMS Notification"
                              className={cn(
                                "p-1.5 rounded-md border text-xs transition-all",
                                rule.enabledChannels.includes("sms")
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold"
                                  : "bg-muted/40 text-muted-foreground/50 border-border"
                              )}
                            >
                              <Smartphone className="h-3.5 w-3.5" />
                            </button>

                            {/* Email Channel */}
                            <button
                              type="button"
                              onClick={() => handleToggleChannel(rule.id, "email")}
                              title="Toggle Email Notification"
                              className={cn(
                                "p-1.5 rounded-md border text-xs transition-all",
                                rule.enabledChannels.includes("email")
                                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40 font-bold"
                                  : "bg-muted/40 text-muted-foreground/50 border-border"
                              )}
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>

                            {/* WhatsApp Channel */}
                            <button
                              type="button"
                              onClick={() => handleToggleChannel(rule.id, "whatsapp")}
                              title="Toggle WhatsApp Notification"
                              className={cn(
                                "p-1.5 rounded-md border text-xs transition-all",
                                rule.enabledChannels.includes("whatsapp")
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold"
                                  : "bg-muted/40 text-muted-foreground/50 border-border"
                              )}
                            >
                              <MessageSquareCode className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-center">
                          {rule.hasEscalationLadder ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px]">
                              Ladder Active
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono">—</span>
                          )}
                        </TableCell>

                        <TableCell className="align-top text-right">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggleRuleActive(rule.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 3: ESCALATION RULES BUILDER                                */}
        {/* ============================================================== */}
        <TabsContent value="ladders" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" /> Multi-Tier Escalation Ladders
                </CardTitle>
                <CardDescription className="text-xs">
                  Reusable sequential escalation steps with defined time thresholds and fallback recipients across clinical and operational areas.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shrink-0"
                onClick={() => setNewLadderModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" /> + New Ladder
              </Button>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ladders.map((ladder) => (
                  <Card key={ladder.id} className="border-border bg-card shadow-xs">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/60 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-amber-600" /> {ladder.name}
                          </CardTitle>
                          <CardDescription className="text-[10px]">
                            {ladder.department} • Trigger: <span className="font-semibold text-primary">{ladder.eventType}</span>
                          </CardDescription>
                        </div>
                        <Badge
                          className={
                            ladder.enabled
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]"
                              : "bg-muted text-muted-foreground text-[9px]"
                          }
                        >
                          {ladder.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-3.5 space-y-3 text-xs">
                      {/* Stepped Timeline */}
                      <div className="space-y-2">
                        {ladder.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <div className="flex flex-col items-center">
                              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono font-bold text-[10px] flex items-center justify-center border border-primary/30 shrink-0">
                                L{step.level}
                              </span>
                              {idx < ladder.steps.length - 1 && (
                                <div className="w-0.5 h-6 bg-border my-0.5" />
                              )}
                            </div>

                            <div className="flex-1 pb-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">{step.name}</span>
                                <Badge variant="outline" className="text-[9px] font-mono">
                                  {step.thresholdMinutes === 0 ? "Immediate (0m)" : `+${step.thresholdMinutes} mins`}
                                </Badge>
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center justify-between mt-0.5">
                                <span>Role: {step.role}</span>
                                <Badge variant="secondary" className="text-[8px] uppercase px-1 py-0">
                                  {step.channel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Fallback Contact & Status */}
                      <div className="p-2.5 rounded-md bg-muted/20 border border-border text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-semibold">Fallback Escalation:</span>
                          <span className="font-mono text-primary font-medium">{ladder.fallbackRecipient}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Auto-Resolve on Action:</span>
                          <span className="text-emerald-600 font-semibold">Enabled</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 4: ESCALATION HISTORY & INCIDENT LOG                       */}
        {/* ============================================================== */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" /> Operational Incident &amp; Escalation Audit Log
              </CardTitle>
              <CardDescription className="text-xs">
                Comprehensive record of every triggered escalation, stepped dispatch timeline, response latency, and resolution sign-offs.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[120px]">Incident Code</TableHead>
                      <TableHead className="text-xs font-bold w-[220px]">Event &amp; Department</TableHead>
                      <TableHead className="text-xs font-bold w-[140px]">Triggered At</TableHead>
                      <TableHead className="text-xs font-bold w-[220px]">Stepped Dispatch</TableHead>
                      <TableHead className="text-xs font-bold w-[90px]">Duration</TableHead>
                      <TableHead className="text-xs font-bold w-[110px]">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((rec) => (
                      <TableRow key={rec.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary align-top">
                          {rec.incidentCode}
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="font-semibold text-xs text-foreground">{rec.title}</div>
                          <div className="text-[10px] text-muted-foreground">{rec.department}</div>
                          <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 mt-0.5 font-mono">
                            {rec.eventType}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-mono text-xs text-muted-foreground align-top">
                          {formatDateTime(rec.triggeredAt)}
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="space-y-1">
                            {rec.stepsTaken.map((st, i) => (
                              <div key={i} className="flex items-center justify-between text-[10px]">
                                <span className="text-foreground font-medium truncate max-w-[140px]">
                                  {st.step}
                                </span>
                                <Badge
                                  className={cn(
                                    "text-[8px] px-1 py-0 h-3.5",
                                    st.status === "Acknowledged"
                                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                      : st.status === "Timed Out"
                                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                                      : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                                  )}
                                >
                                  {st.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-xs text-foreground font-semibold align-top">
                          {rec.durationMinutes} mins
                        </TableCell>

                        <TableCell className="align-top">
                          <Badge
                            className={cn(
                              "text-[10px]",
                              rec.status === "Resolved"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : rec.status === "Escalated"
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            )}
                          >
                            {rec.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right align-top space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold"
                            onClick={() => handleOpenTimeline(rec)}
                          >
                            <Eye className="h-3 w-3 mr-1" /> Log
                          </Button>
                          {rec.status !== "Resolved" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleOpenResolveModal(rec)}
                            >
                              <Check className="h-3 w-3 mr-1" /> Resolve
                            </Button>
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
      </Tabs>

      {/* ============================================================== */}
      {/* MODAL 1: NEW ESCALATION LADDER BUILDER                         */}
      {/* ============================================================== */}
      <Dialog open={newLadderModalOpen} onOpenChange={setNewLadderModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveLadder}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5 text-amber-600" /> Build Multi-Tier Escalation Ladder
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure sequential notification tiers and time thresholds for automatic operational escalation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="lad-name">Escalation Ladder Title *</Label>
                <Input
                  id="lad-name"
                  required
                  placeholder="e.g. Cath Lab Acute STEMI Door-to-Balloon Ladder"
                  value={ladderName}
                  onChange={(e) => setLadderName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="lad-event">Event Trigger Type</Label>
                  <Select value={ladderEventType} onValueChange={(v: any) => setLadderEventType(v)}>
                    <SelectTrigger id="lad-event" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency SOS">Emergency SOS</SelectItem>
                      <SelectItem value="Surgery blocker">Surgery blocker</SelectItem>
                      <SelectItem value="Bed shortage">Bed shortage</SelectItem>
                      <SelectItem value="Staffing gap">Staffing gap</SelectItem>
                      <SelectItem value="Doctor delay">Doctor delay</SelectItem>
                      <SelectItem value="Security alert">Security alert</SelectItem>
                      <SelectItem value="Critical lab/result">Critical lab/result</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="lad-dept">Department / Domain</Label>
                  <Input
                    id="lad-dept"
                    required
                    value={ladderDepartment}
                    onChange={(e) => setLadderDepartment(e.target.value)}
                  />
                </div>
              </div>

              {/* Steps Configuration */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  3-Tier Sequential Escalation Steps:
                </span>

                {/* Level 1 */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-[11px] font-bold text-primary font-mono">L1 (Immediate):</span>
                  <Input
                    placeholder="Role: On-Duty Resident"
                    className="col-span-2 text-xs h-8"
                    required
                    value={ladderStep1Role}
                    onChange={(e) => setLadderStep1Role(e.target.value)}
                  />
                </div>

                {/* Level 2 */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-amber-600 font-mono">L2:</span>
                    <Input
                      type="number"
                      className="w-14 text-xs h-8 font-mono"
                      value={ladderStep2Minutes}
                      onChange={(e) => setLadderStep2Minutes(Number(e.target.value))}
                    />
                    <span className="text-[10px] text-muted-foreground">m</span>
                  </div>
                  <Input
                    placeholder="Role: Senior Specialist / HOD"
                    className="col-span-2 text-xs h-8"
                    required
                    value={ladderStep2Role}
                    onChange={(e) => setLadderStep2Role(e.target.value)}
                  />
                </div>

                {/* Level 3 */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-rose-600 font-mono">L3:</span>
                    <Input
                      type="number"
                      className="w-14 text-xs h-8 font-mono"
                      value={ladderStep3Minutes}
                      onChange={(e) => setLadderStep3Minutes(Number(e.target.value))}
                    />
                    <span className="text-[10px] text-muted-foreground">m</span>
                  </div>
                  <Input
                    placeholder="Role: Hospital Admin / Med. Sup."
                    className="col-span-2 text-xs h-8"
                    required
                    value={ladderStep3Role}
                    onChange={(e) => setLadderStep3Role(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="lad-fall">Fallback Emergency Recipient *</Label>
                <Input
                  id="lad-fall"
                  required
                  placeholder="e.g. Chief Medical Officer (+91 98200 99887)"
                  value={ladderFallback}
                  onChange={(e) => setLadderFallback(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setNewLadderModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save &amp; Activate Ladder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL 2: RESOLVE INCIDENT MODAL                                */}
      {/* ============================================================== */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmResolve}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Resolve &amp; Close Escalation Incident
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide clinical / operational resolution details for <strong>{selectedRecord?.incidentCode}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incident Title:</span>
                  <span className="font-bold text-foreground">{selectedRecord?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trigger Time:</span>
                  <span className="font-mono">{formatDateTime(selectedRecord?.triggeredAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Step:</span>
                  <Badge className="bg-destructive text-destructive-foreground text-[8px]">
                    {selectedRecord?.currentStep}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="res-notes">Resolution Action &amp; Audit Notes *</Label>
                <Input
                  id="res-notes"
                  required
                  placeholder="e.g. Anesthesia gas manifold swapped to reserve cylinder; case resumed safely."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirm Resolution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL 3: INCIDENT TIMELINE INSPECT MODAL                       */}
      {/* ============================================================== */}
      <Dialog open={timelineModalOpen} onOpenChange={setTimelineModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Incident Escalation Dispatch Log
            </DialogTitle>
            <DialogDescription className="text-xs">
              Audit trail for incident <strong>{inspectRecord?.incidentCode}</strong> ({inspectRecord?.title}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/20 border border-border">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Department</span>
                <span className="font-semibold">{inspectRecord?.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Duration</span>
                <span className="font-mono font-bold text-foreground">{inspectRecord?.durationMinutes} mins</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase block">Stepped Dispatch Log:</span>
              <div className="space-y-2 border-l-2 border-primary/30 pl-3 ml-2">
                {inspectRecord?.stepsTaken.map((step, idx) => (
                  <div key={idx} className="space-y-0.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{step.step}</span>
                      <Badge variant="outline" className="text-[8px] font-mono">
                        {step.channel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex justify-between">
                      <span>Recipient: {step.recipient}</span>
                      <span className="font-mono">{formatDateTime(step.notifiedAt)}</span>
                    </div>
                    <Badge
                      className={cn(
                        "text-[8px] px-1 py-0 h-3.5 mt-0.5",
                        step.status === "Acknowledged"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : step.status === "Timed Out"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                      )}
                    >
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {inspectRecord?.resolvedAt && (
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold block">
                  Resolved by {inspectRecord.resolvedBy}
                </span>
                <p className="text-xs text-foreground italic">"{inspectRecord.resolutionNotes}"</p>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  Closed at: {formatDateTime(inspectRecord.resolvedAt)}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button size="sm" onClick={() => setTimelineModalOpen(false)}>
              Close Audit Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
