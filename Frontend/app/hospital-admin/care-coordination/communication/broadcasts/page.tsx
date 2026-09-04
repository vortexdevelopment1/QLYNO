"use client";

import { useState } from "react";
import {
  Megaphone,
  Search,
  Plus,
  ShieldAlert,
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
import { mockBroadcastRecords } from "@/hospital-admin/lib/mock-data/communication-hub";
import { BroadcastRecord } from "@/hospital-admin/lib/types";

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(mockBroadcastRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = broadcasts.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.broadcastId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.triggeredBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const activeCount = broadcasts.filter((b) => b.status === "Active").length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                Emergency Ops
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Hospital Broadcasts
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Code Blue alerts, facility bulletins, and hospital-wide PA / staff-push notifications.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-8 text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Trigger Broadcast
          </Button>
        </div>
      </div>

      <CommunicationNav unreadChatCount={3} activeBroadcastCount={activeCount || 1} pendingRemindersCount={8} />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live / Active
              </CardTitle>
              <Megaphone className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{activeCount}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">Currently displayed on PA / staff apps</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Code Blue Events
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">
                {broadcasts.filter((b) => b.type === "Code Blue").length}
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground">Crash-team acknowledgement tracked</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Broadcasts
              </CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{broadcasts.length}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">Hospital-wide and scoped deliveries</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-rose-600" />
                  Broadcast Log
                </CardTitle>
                <CardDescription className="text-xs">
                  Acknowledgement counts are recorded against the target audience size.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search title, ID, originator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All types</SelectItem>
                    <SelectItem value="Code Blue" className="text-xs">Code Blue</SelectItem>
                    <SelectItem value="Operational" className="text-xs">Operational</SelectItem>
                    <SelectItem value="Emergency" className="text-xs">Emergency</SelectItem>
                    <SelectItem value="Clinical Alert" className="text-xs">Clinical Alert</SelectItem>
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
                    <th className="px-4 py-3">Broadcast</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Scope</th>
                    <th className="px-4 py-3">Channels</th>
                    <th className="px-4 py-3">Ack</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Triggered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                        No broadcasts match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{item.title}</div>
                          <div className="mt-1 max-w-md text-[11px] text-muted-foreground line-clamp-2">
                            {item.message}
                          </div>
                          <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                            {item.broadcastId} • {item.triggeredBy}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              item.type === "Code Blue"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]"
                                : "text-[10px]"
                            }
                            variant={item.type === "Code Blue" ? "outline" : "outline"}
                          >
                            {item.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.targetScope}</div>
                          {item.targetDetail && (
                            <div className="text-[11px] text-muted-foreground">{item.targetDetail}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.channels.map((ch) => (
                              <Badge key={ch} variant="secondary" className="text-[10px]">{ch}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          {item.acknowledgedCount ?? 0} / {item.targetAudienceSize ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {item.status === "Active" ? (
                            <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] animate-pulse">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                              {item.status}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                          {item.triggeredAt}
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

      <ComposeBroadcastModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onBroadcastCreated={(broadcast) => setBroadcasts((prev) => [broadcast, ...prev])}
      />
    </div>
  );
}
