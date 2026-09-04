"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bed,
  CheckCircle2,
  Clock,
  Edit2,
  FileCheck,
  HeartPulse,
  Layers,
  MapPin,
  Pill,
  Shield,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { updatePostOpRecovery, PostOpRecoveryRecord } from "@/hospital-admin/store/slices/surgicalSlice";
import { format } from "date-fns";
import { cn } from "@/hospital-admin/lib/utils";

export default function PostOpBoardPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cases } = useSelector((state: RootState) => state.surgical);

  // Modal State for Handoff / Transfer
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PostOpRecoveryRecord | null>(null);
  const [targetBed, setTargetBed] = useState("ICU Bed 04");
  const [targetStatus, setTargetStatus] = useState<PostOpRecoveryRecord["status"]>("Transferred to ICU");
  const [drainOutputText, setDrainOutputText] = useState("");

  // Extract all postOpRecovery records
  const recoveryRecords: PostOpRecoveryRecord[] = cases
    .map((c) => c.postOpRecovery)
    .filter((r): r is PostOpRecoveryRecord => r !== undefined);

  const handleOpenTransfer = (record: PostOpRecoveryRecord) => {
    setSelectedRecord(record);
    setTargetBed(record.targetIcuBed || "ICU-04");
    setTargetStatus(record.status);
    setDrainOutputText(record.drainOutput);
    setTransferModalOpen(true);
  };

  const handleSaveTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    dispatch(
      updatePostOpRecovery({
        caseId: selectedRecord.caseId,
        status: targetStatus,
        targetIcuBed: targetBed,
        drainOutput: drainOutputText || selectedRecord.drainOutput,
        icuHandoverReady: true,
      })
    );

    toast({
      title: "Recovery Record Updated",
      description: `Patient handoff status updated to ${targetStatus} (${targetBed}).`,
    });
    setTransferModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Post-Op Recovery &amp; PACU Handoff Board"
        description="Live monitoring of post-anesthetic recovery, surgical drain metrics, and ICU/ward step-down handoffs."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Post-Op Board" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="gap-1.5 font-semibold text-xs">
              <Link href="/hospital-admin/ipd">
                <Bed className="h-3.5 w-3.5 text-primary" /> View IPD Bed Matrix
              </Link>
            </Button>
          </div>
        }
      />

      <SurgicalNav />

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active in PACU</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{recoveryRecords.length} Patients</p>
          <span className="text-[10px] text-muted-foreground">Post-anesthesia recovery</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Stable Vitals</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {recoveryRecords.filter((r) => r.vitalsStatus === "Stable").length} Patients
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Extubated &amp; responsive</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">ICU Step-Down Ready</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {recoveryRecords.filter((r) => r.icuHandoverReady).length} Ready
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Handoff checklist complete</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Critical / Guarded</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {recoveryRecords.filter((r) => r.vitalsStatus !== "Stable").length} Patients
          </p>
          <span className="text-[10px] text-amber-600 font-medium">High acuity monitoring</span>
        </Card>
      </div>

      {/* Recovery Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">PACU Live Patient Registry</CardTitle>
          <CardDescription className="text-xs">
            Continuously tracked vitals, surgical site observations, and step-down destinations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient &amp; Case</TableHead>
                <TableHead>PACU Bay / Bed</TableHead>
                <TableHead>Procedure &amp; Surgeon</TableHead>
                <TableHead>Vitals Status</TableHead>
                <TableHead>Surgical Drain Output</TableHead>
                <TableHead>Step-Down Destination</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recoveryRecords.map((rec) => (
                <TableRow key={rec.caseId}>
                  <TableCell>
                    <div>
                      <strong className="text-xs font-bold text-foreground">{rec.patientName}</strong>
                      <span className="text-[10px] font-mono text-primary block">{rec.caseId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{rec.pacuBed}</TableCell>
                  <TableCell className="text-xs">
                    <p className="font-medium text-foreground">{rec.procedureType}</p>
                    <span className="text-[10px] text-muted-foreground">{rec.surgeonName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rec.vitalsStatus === "Stable"
                          ? "success"
                          : rec.vitalsStatus === "Critical"
                          ? "destructive"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {rec.vitalsStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{rec.drainOutput}</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {rec.status}
                      </Badge>
                      {rec.targetIcuBed && (
                        <span className="text-[10px] text-muted-foreground">({rec.targetIcuBed})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleOpenTransfer(rec)}
                    >
                      <Edit2 className="h-3 w-3 text-primary" /> Update Handoff
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {recoveryRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No surgical patients currently in PACU recovery.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL: UPDATE HANDOFF & STEP-DOWN                                         */}
      {/* ========================================================================= */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Update PACU Recovery &amp; Handoff
            </DialogTitle>
            <DialogDescription>
              Record vitals stability, drain output, and step-down ward/ICU bed transfer for {selectedRecord?.patientName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTransferSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Recovery Status</Label>
              <Select value={targetStatus} onValueChange={(val: any) => setTargetStatus(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Recovery">In Recovery (PACU)</SelectItem>
                  <SelectItem value="Transferred to ICU">Transferred to ICU</SelectItem>
                  <SelectItem value="Shifted to Ward">Shifted to Inpatient Ward</SelectItem>
                  <SelectItem value="Discharged">Discharged (Day Surgery)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Bed / Ward</Label>
                <Input value={targetBed} onChange={(e) => setTargetBed(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Drain Output Volume</Label>
                <Input
                  value={drainOutputText}
                  onChange={(e) => setDrainOutputText(e.target.value)}
                  placeholder="e.g. 50 mL serosanguinous"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setTransferModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Handoff Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
