"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  FlaskConical,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  TestTube,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { LabNav } from "@/hospital-admin/components/lab/lab-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockExtendedLabOrders, mockRejectionReasons } from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import { LabOrder, LabOrderStatus } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Lab Management workflow";

export default function LabOrdersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [orders, setOrders] = useState<LabOrder[]>(mockExtendedLabOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Recollection Modal State
  const [recollectionModalOpen, setRecollectionModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("HEM-01");
  const [rejectionNotes, setRejectionNotes] = useState("");

  // New Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [uhid, setUhid] = useState("");
  const [testName, setTestName] = useState("Complete Blood Count (CBC)");
  const [department, setDepartment] = useState("Hematology");
  const [orderingDoctor, setOrderingDoctor] = useState("Dr. Arvind Swaminathan");
  const [orderingSource, setOrderingSource] = useState<any>("OPD");
  const [priority, setPriority] = useState<"Routine" | "Stat">("Routine");
  const [sampleType, setSampleType] = useState("Whole Blood (EDTA)");
  const [patientLocation, setPatientLocation] = useState("OPD Consultation Room 101");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.patientName.toLowerCase().includes(search.toLowerCase()) ||
        (o.uhid && o.uhid.toLowerCase().includes(search.toLowerCase())) ||
        o.test.toLowerCase().includes(search.toLowerCase()) ||
        o.orderingDoctor.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesDept = departmentFilter === "all" || o.department === departmentFilter;
      const matchesPriority = priorityFilter === "all" || o.priority === priorityFilter;
      const matchesSource = sourceFilter === "all" || o.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesDept && matchesPriority && matchesSource;
    });
  }, [orders, search, statusFilter, departmentFilter, priorityFilter, sourceFilter]);

  const criticalOrders = useMemo(() => orders.filter((o) => o.critical), [orders]);

  const handleOpenRecollection = (order: LabOrder) => {
    setSelectedOrder(order);
    setRecollectionModalOpen(true);
  };

  const handleConfirmRecollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: "rejected",
              criticalDetails: `Sample rejected: ${rejectionReason}. Re-draw dispatched to nurse station.`,
            }
          : o
      )
    );

    toast({
      title: "Sample Rejected & Recollection Dispatched",
      description: `${selectedOrder.orderNo} failed QC. Re-draw alert routed to ${selectedOrder.patientLocation || "Nurse Station"}. (${DELEGATION_STRING})`,
    });
    setRecollectionModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: LabOrder = {
      id: `lab_${Date.now()}`,
      orderNo: `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      uhid: uhid || `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      test: testName,
      department,
      orderingDoctor,
      source: orderingSource,
      priority,
      sampleType,
      sampleId: `SAMP-${Math.floor(10000 + Math.random() * 90000)}`,
      patientLocation,
      status: "sample-pending",
      orderedOn: new Date().toISOString(),
      tat: priority === "Stat" ? "45 mins SLA" : "2.5 hours SLA",
      tariffId: "TAR-LAB-GEN",
      price: 500,
    };

    setOrders((prev) => [newOrder, ...prev]);
    toast({
      title: "Diagnostic Investigation Ordered",
      description: `${newOrder.orderNo} (${newOrder.test}) queued for sample collection. (${DELEGATION_STRING})`,
    });
    setOrderModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Laboratory &amp; Diagnostics Management"
          description="Central investigation registry, sample collection workflow, automated analyzer telemetry, and diagnostic reports."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading central lab orders...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Laboratory &amp; Diagnostics Management"
        description="Central investigation registry, sample collection workflow, automated analyzer telemetry, and diagnostic reports."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setOrderModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Test Order
          </Button>
        }
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Pathology &amp; Diagnostic Core" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Operational order workflow • Diagnostic interpretation certified by pathologists</span>
        </div>
      </div>

      {/* Critical Panic-Value Alert Banner (Rule F13-CANNOT-5) */}
      {criticalOrders.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-xs font-bold text-destructive">
                  {criticalOrders.length} Critical Panic-Value Result(s) Detected
                </p>
                <p className="text-[11px] text-foreground mt-0.5">
                  {criticalOrders[0].patientName} ({criticalOrders[0].test}) — {criticalOrders[0].criticalDetails || "Life-threatening panic value."}
                </p>
              </div>
            </div>
            <Button size="sm" variant="destructive" asChild className="text-xs shrink-0">
              <Link href="/hospital-admin/lab/critical">
                <AlertOctagon className="h-3.5 w-3.5 mr-1" /> View Critical Reports Log
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Active Orders</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{orders.length} Orders</p>
          <span className="text-[10px] text-muted-foreground">Today's total workload</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Sample Pending</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {orders.filter((o) => o.status === "sample-pending").length} Phlebotomy
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting ward/OPD collection</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">On Analyzers</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {orders.filter((o) => o.status === "processing").length} Processing
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Running in biochemistry/hematology</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Awaiting Pathologist</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {orders.filter((o) => o.status === "awaiting-validation").length} Sign-Off
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Ready for authorization</span>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Central Investigation Registry</CardTitle>
          <CardDescription className="text-xs">
            Single source of truth tracking outpatient, inpatient, emergency, and surgical pre-op diagnostic orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order #, patient, UHID, test..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[120px] text-xs h-9">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="OPD">OPD</SelectItem>
                  <SelectItem value="IPD">IPD</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="OT">OT Pre-Op</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] text-xs h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Stat">Stat Emergency</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Hematology">Hematology</SelectItem>
                  <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="Immunoassay">Immunoassay</SelectItem>
                  <SelectItem value="Hematology & Coagulation">Coagulation</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sample-pending">Sample Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="awaiting-validation">Awaiting Validation</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Order #</TableHead>
                  <TableHead className="text-xs font-bold">Patient Details &amp; Location</TableHead>
                  <TableHead className="text-xs font-bold">Investigation / Panel</TableHead>
                  <TableHead className="text-xs font-bold">Source &amp; Priority</TableHead>
                  <TableHead className="text-xs font-bold">Sample Barcode</TableHead>
                  <TableHead className="text-xs font-bold">Ordering Doctor</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {order.orderNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        {order.patientName}
                        {order.critical && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                            Critical
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {order.uhid} • <span className="text-primary font-sans">{order.patientLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{order.test}</div>
                      <div className="text-[10px] text-muted-foreground">{order.department}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {order.source}
                        </Badge>
                        <Badge
                          className={
                            order.priority === "Stat"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px]"
                              : "text-[9px]"
                          }
                        >
                          {order.priority}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.sampleId || "Awaiting Barcode"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {order.orderingDoctor}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.status === "released"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : order.status === "processing"
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                            : order.status === "awaiting-validation"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : order.status === "sample-pending"
                            ? "bg-muted text-muted-foreground text-[10px]"
                            : "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {order.status === "released" ? (
                        <Button size="sm" variant="ghost" asChild className="h-7 text-xs text-primary font-semibold">
                          <Link href={`/hospital-admin/lab/${order.id}`}>
                            <FileText className="h-3.5 w-3.5 mr-1" /> View PDF
                          </Link>
                        </Button>
                      ) : order.status === "processing" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold text-destructive border-destructive/30"
                          onClick={() => handleOpenRecollection(order)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Reject QC
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="h-7 text-xs font-semibold text-primary"
                        >
                          <Link href="/hospital-admin/lab/sample-collection">
                            <TestTube className="h-3 w-3 mr-1" /> Collect
                          </Link>
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

      {/* Recollection / Reject QC Modal */}
      <Dialog open={recollectionModalOpen} onOpenChange={setRecollectionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmRecollection}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                <RefreshCw className="h-5 w-5 text-destructive" /> Reject Specimen &amp; Dispatch Recollection
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log specimen quality rejection for <strong>{selectedOrder?.orderNo}</strong> ({selectedOrder?.patientName}).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="rej-code">Standardized Rejection Reason *</Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger id="rej-code" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRejectionReasons.map((r) => (
                      <SelectItem key={r.id} value={r.code}>
                        [{r.code}] {r.reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="rej-notes">Laboratory Technical Notes</Label>
                <Input
                  id="rej-notes"
                  placeholder="e.g. Clotted sample observed upon centrifuge"
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                />
              </div>

              <div className="p-2.5 rounded-md border border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-200 text-[11px]">
                An automated re-draw dispatch alert will be triggered directly to <strong>{selectedOrder?.patientLocation || "Nurse Station"}</strong>.
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRecollectionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm">
                Dispatch Recollection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Test Order Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveOrder}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" /> Order Laboratory Investigation
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create a diagnostic requisition linked to patient EMR and billing tariff.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="o-pat">Patient Full Name *</Label>
                <Input
                  id="o-pat"
                  required
                  placeholder="e.g. Shalini Deshmukh"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="o-uhid">UHID</Label>
                  <Input
                    id="o-uhid"
                    placeholder="e.g. UHID-2026-9921"
                    value={uhid}
                    onChange={(e) => setUhid(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="o-src">Ordering Source</Label>
                  <Select value={orderingSource} onValueChange={(val: any) => setOrderingSource(val)}>
                    <SelectTrigger id="o-src" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPD">OPD Consultation</SelectItem>
                      <SelectItem value="IPD">Inpatient Ward</SelectItem>
                      <SelectItem value="Emergency">Emergency / Trauma</SelectItem>
                      <SelectItem value="OT">OT Pre-Op Clearance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="o-test">Test / Panel Name</Label>
                  <Input
                    id="o-test"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="o-prio">Priority</Label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger id="o-prio" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine</SelectItem>
                      <SelectItem value="Stat">Stat Emergency (45m SLA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="o-doc">Ordering Physician</Label>
                  <Input
                    id="o-doc"
                    required
                    value={orderingDoctor}
                    onChange={(e) => setOrderingDoctor(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="o-loc">Patient Location / Room</Label>
                  <Input
                    id="o-loc"
                    required
                    value={patientLocation}
                    onChange={(e) => setPatientLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOrderModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Submit Test Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
