"use client";

import React from "react";
import {
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowLeftRight,
  ShieldCheck,
  Trash2,
  Calendar,
  User,
  Clock,
  Wrench,
  Cpu,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { BiomedicalAsset, AssetHistoryEvent, AssetEventType } from "@/hospital-admin/lib/types";

interface AssetHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: BiomedicalAsset | null;
  historyEvents: AssetHistoryEvent[];
}

export function AssetHistoryDrawer({
  open,
  onOpenChange,
  asset,
  historyEvents,
}: AssetHistoryDrawerProps) {
  if (!asset) return null;

  const assetEvents = historyEvents
    .filter((e) => e.assetId === asset.id || e.assetCode === asset.assetCode)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getEventBadge = (type: AssetEventType) => {
    switch (type) {
      case "Registration":
        return <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">Registration</Badge>;
      case "PPM Certified":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">PPM Certified</Badge>;
      case "Breakdown Reported":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]">Breakdown Reported</Badge>;
      case "Repair Completed":
        return <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 text-[10px]">Repair Completed</Badge>;
      case "Allocation / Transfer":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">Allocation / Transfer</Badge>;
      case "Warranty Renewed":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px]">Warranty Renewed</Badge>;
      case "Decommissioned":
        return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 text-[10px]">Decommissioned</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{type}</Badge>;
    }
  };

  const getEventIcon = (type: AssetEventType) => {
    switch (type) {
      case "Registration":
        return <Cpu className="h-4 w-4 text-cyan-600" />;
      case "PPM Certified":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "Breakdown Reported":
        return <AlertTriangle className="h-4 w-4 text-rose-600" />;
      case "Repair Completed":
        return <Wrench className="h-4 w-4 text-indigo-600" />;
      case "Allocation / Transfer":
        return <ArrowLeftRight className="h-4 w-4 text-amber-600" />;
      case "Warranty Renewed":
        return <ShieldCheck className="h-4 w-4 text-purple-600" />;
      case "Decommissioned":
        return <Trash2 className="h-4 w-4 text-slate-600" />;
      default:
        return <History className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Lifecycle Audit History
          </DialogTitle>
          <DialogDescription className="text-xs">
            Chronological audit timeline for <strong>{asset.name} [{asset.assetCode}]</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Asset Summary Header Card */}
        <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Category &amp; Serial:</span>
            <span className="font-mono font-semibold text-foreground">{asset.category} • {asset.serialNo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Department &amp; Room:</span>
            <span className="font-medium text-foreground">{asset.department} ({asset.installedRoom || asset.floor})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Maintenance Status:</span>
            <Badge
              className={
                asset.maintenanceStatus === "Operational"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                  : asset.maintenanceStatus === "Calibration Due"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
              }
            >
              {asset.maintenanceStatus}
            </Badge>
          </div>
        </div>

        {/* Timeline Events List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Audit Trail Events ({assetEvents.length})
          </h4>

          {assetEvents.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
              No historical lifecycle events recorded yet for this asset.
            </div>
          ) : (
            <div className="relative border-l-2 border-border ml-5 pl-7 space-y-4 py-2">
              {assetEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Timeline Dot Icon */}
                  <div className="absolute -left-[43px] top-3 h-7 w-7 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-xs shrink-0 z-10">
                    {getEventIcon(evt.eventType)}
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/20 transition-all shadow-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-foreground">{evt.title}</span>
                      <div className="shrink-0">{getEventBadge(evt.eventType)}</div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{evt.details}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">{evt.actor}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" suppressHydrationWarning>
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(evt.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          {new Date(evt.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
