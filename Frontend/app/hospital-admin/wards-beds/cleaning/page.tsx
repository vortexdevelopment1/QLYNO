"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  User,
  UserCheck,
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
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { WardsBedsNav } from "@/hospital-admin/components/wards-beds/wards-beds-nav";
import { assignCleaningStaff, completeCleaningTask } from "@/hospital-admin/store/slices/wardsBedsSlice";
import { BedCleaningTask } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function CleaningTurnaroundPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cleaningTasks, beds } = useSelector((state: RootState) => state.wardsBeds);

  // Complete Dialog State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BedCleaningTask | null>(null);
  const [housekeeperName, setHousekeeperName] = useState("Sunita Reddy (Housekeeping Lead)");

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTasks = cleaningTasks.filter((t) => t.status !== "Done");
  const completedTasks = cleaningTasks.filter((t) => t.status === "Done");

  const handleOpenComplete = (task: BedCleaningTask) => {
    setSelectedTask(task);
    setHousekeeperName(task.assignedStaffName || "Sunita Reddy (Housekeeping Lead)");
    setCompleteModalOpen(true);
  };

  const handleExecuteComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    dispatch(
      completeCleaningTask({
        taskId: selectedTask.id,
        completedBy: housekeeperName,
      })
    );

    toast({
      title: "Bed Sanitization Completed",
      description: `${selectedTask.bedNumber} certified cleaned and returned to Available status.`,
    });
    setCompleteModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Bed Cleaning &amp; Sanitization Turnaround Board"
          description="Automated turnaround task queue, Housekeeping dispatch, and mandatory Terminal-Isolation certification."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Cleaning Turnaround" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading cleaning board...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Bed Cleaning &amp; Sanitization Turnaround Board"
        description="Automated turnaround task queue, Housekeeping dispatch, and mandatory Terminal-Isolation certification."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Cleaning Turnaround" }]}
      />

      <WardsBedsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Cleaning Tasks</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{activeTasks.length} Beds</p>
          <span className="text-[10px] text-cyan-600 font-medium">Turnaround in progress</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Turnaround Time</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">24.5 Mins</p>
          <span className="text-[10px] text-primary font-medium">Within 30m hospital SLA</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Isolation Terminal Tasks</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {activeTasks.filter((t) => t.protocol === "Terminal-Isolation").length} High-Acuity
          </p>
          <span className="text-[10px] text-amber-600 font-medium">UV-C &amp; deep gas fogging</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Auto-Trigger Integration</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Automated</p>
          <span className="text-[10px] text-emerald-600 font-medium">Zero manual omissions</span>
        </Card>
      </div>

      {/* Active Cleaning Tasks Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Sanitization &amp; Turnaround Task Queue</CardTitle>
          <CardDescription className="text-xs">
            Tasks auto-created upon patient discharge or transfer-out, requiring housekeeping certification.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Bed #</TableHead>
                  <TableHead className="text-xs font-bold">Ward Unit</TableHead>
                  <TableHead className="text-xs font-bold">Vacated / Triggered Time</TableHead>
                  <TableHead className="text-xs font-bold">Disinfection Protocol</TableHead>
                  <TableHead className="text-xs font-bold">Assigned Housekeeper</TableHead>
                  <TableHead className="text-xs font-bold">SLA Target</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Certification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-cyan-600">
                      {task.bedNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">{task.wardName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(task.triggeredAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          task.protocol === "Terminal-Isolation"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "text-[10px]"
                        }
                      >
                        {task.protocol}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium">
                      {task.assignedStaffName || "Unassigned (Housekeeping Lead)"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-primary font-bold">
                      {task.turnaroundMinutes} Mins
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="h-7 text-xs font-semibold"
                        onClick={() => handleOpenComplete(task)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Ready
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Complete Task Dialog */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleExecuteComplete}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Certify Sanitization &amp; Release Bed
              </DialogTitle>
              <DialogDescription className="text-xs">
                Confirm completion of <strong>{selectedTask?.protocol}</strong> protocol for {selectedTask?.bedNumber}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bed &amp; Ward:</span>
                  <span className="font-semibold text-foreground">{selectedTask?.bedNumber} ({selectedTask?.wardName})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Required Protocol:</span>
                  <Badge variant="outline" className="text-[10px]">{selectedTask?.protocol}</Badge>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="hk-staff">Certified Housekeeping Staff Name</Label>
                <Input
                  id="hk-staff"
                  required
                  value={housekeeperName}
                  onChange={(e) => setHousekeeperName(e.target.value)}
                />
              </div>

              {selectedTask?.protocol === "Terminal-Isolation" && (
                <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-950 dark:text-amber-200 text-[11px]">
                  <strong>Terminal-Isolation Sign-Off:</strong> Confirms UV-C light cycle completed, HEPA air changes achieved, and disposable linen bagged per biohazard guidelines.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCompleteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Sign-Off &amp; Return to Available
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
