"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Award,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Tag,
  TestTube,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { LabNav } from "@/hospital-admin/components/lab/lab-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  mockLabTestCatalog,
  mockAnalyzerRegistry,
  mockCriticalThresholds,
  mockRejectionReasons,
} from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import {
  LabTestCatalogItem,
  AnalyzerRegistryItem,
  CriticalThresholdItem,
  RejectionReasonItem,
} from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Laboratory Quality Configuration workflow";

export default function LabSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("catalog");
  const [catalog, setCatalog] = useState<LabTestCatalogItem[]>(mockLabTestCatalog);
  const [analyzers, setAnalyzers] = useState<AnalyzerRegistryItem[]>(mockAnalyzerRegistry);
  const [thresholds, setThresholds] = useState<CriticalThresholdItem[]>(mockCriticalThresholds);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReasonItem[]>(mockRejectionReasons);

  // Add Test Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testCode, setTestCode] = useState("");
  const [testName, setTestName] = useState("");
  const [department, setDepartment] = useState("Hematology");
  const [sampleType, setSampleType] = useState("Whole Blood (EDTA)");
  const [referenceRange, setReferenceRange] = useState("");
  const [unit, setUnit] = useState("mg/dL");
  const [tariffId, setTariffId] = useState("");
  const [price, setPrice] = useState(500);

  // Edit Critical Threshold Modal State (Rule F13-CANNOT-10)
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState<CriticalThresholdItem | null>(null);
  const [lowPanic, setLowPanic] = useState(0);
  const [highPanic, setHighPanic] = useState(0);
  const [auditorName, setAuditorName] = useState("Dr. Sunita Kulkarni (Head of Pathology)");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    const newTest: LabTestCatalogItem = {
      id: `tst_${Date.now()}`,
      testCode: testCode || `LAB-${Date.now().toString().slice(-4)}`,
      testName,
      department,
      sampleType,
      referenceRange,
      unit,
      turnaroundHours: 1.5,
      tariffId: tariffId || `TAR-LAB-${Date.now().toString().slice(-4)}`,
      price,
    };

    setCatalog((prev) => [newTest, ...prev]);
    toast({
      title: "Test / Panel Registered in Catalog",
      description: `${newTest.testName} (${newTest.testCode}) mapped to tariff ${newTest.tariffId} (₹${newTest.price}). (${DELEGATION_STRING})`,
    });
    setTestModalOpen(false);
  };

  const handleOpenThreshold = (th: CriticalThresholdItem) => {
    setSelectedThreshold(th);
    setLowPanic(th.lowPanic);
    setHighPanic(th.highPanic);
    setThresholdModalOpen(true);
  };

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreshold) return;

    // Rule F13-CANNOT-10: Critical value threshold edits must be audited
    const timestamp = new Date().toISOString();

    setThresholds((prev) =>
      prev.map((th) =>
        th.id === selectedThreshold.id
          ? {
              ...th,
              lowPanic,
              highPanic,
              lastAuditedAt: timestamp,
              auditedBy: auditorName,
            }
          : th
      )
    );

    toast({
      title: "Critical Threshold Audited & Updated",
      description: `${selectedThreshold.testName} panic boundaries updated by ${auditorName}. Audit logged. (${DELEGATION_STRING})`,
    });
    setThresholdModalOpen(false);
    setSelectedThreshold(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Laboratory &amp; Diagnostics Settings"
          description="Test/panel formulary tariffs, auto-analyzer registry, panic-value thresholds, and QC protocols."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Settings" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading lab settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Laboratory &amp; Diagnostics Settings"
        description="Test/panel formulary tariffs, auto-analyzer registry, panic-value thresholds, and QC protocols."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Settings" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setTestModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Test / Panel
          </Button>
        }
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Laboratory Standards &amp; Tariffs Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Formulary &amp; Tariff Standards • Test tariffs gate Billing auto-accrual • Threshold edits are strictly audited</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 max-w-2xl">
          <TabsTrigger value="catalog" className="text-xs">Test Catalog ({catalog.length})</TabsTrigger>
          <TabsTrigger value="analyzers" className="text-xs">Analyzers ({analyzers.length})</TabsTrigger>
          <TabsTrigger value="thresholds" className="text-xs">Critical Thresholds ({thresholds.length})</TabsTrigger>
          <TabsTrigger value="rejection" className="text-xs">Rejection Codes ({rejectionReasons.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: TEST CATALOG */}
        <TabsContent value="catalog" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Investigation Formulary &amp; Tariff Linking</CardTitle>
              <CardDescription className="text-xs">
                Manage test codes, reference ranges, specimen tubes, and linked billing tariffs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Test Code</TableHead>
                      <TableHead className="text-xs font-bold">Test / Panel Name</TableHead>
                      <TableHead className="text-xs font-bold">Department</TableHead>
                      <TableHead className="text-xs font-bold">Required Specimen</TableHead>
                      <TableHead className="text-xs font-bold">Normal Reference Range</TableHead>
                      <TableHead className="text-xs font-bold">Linked Tariff ID</TableHead>
                      <TableHead className="text-xs font-bold">Standard Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalog.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {item.testCode}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-foreground">
                          {item.testName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.department}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.sampleType}</TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                          {item.referenceRange}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {item.tariffId}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          ₹{item.price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ANALYZERS */}
        <TabsContent value="analyzers" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Automated Laboratory Analyzers &amp; Instruments</CardTitle>
              <CardDescription className="text-xs">
                Manage high-throughput analyzers, bidirectional LIS connections, and maintenance calibration dates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Analyzer ID</TableHead>
                      <TableHead className="text-xs font-bold">Instrument Name &amp; Model</TableHead>
                      <TableHead className="text-xs font-bold">Department</TableHead>
                      <TableHead className="text-xs font-bold">Daily Volume</TableHead>
                      <TableHead className="text-xs font-bold">Last Calibration</TableHead>
                      <TableHead className="text-xs font-bold">Next Calibration</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyzers.map((ana) => (
                      <TableRow key={ana.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {ana.analyzerId}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{ana.name}</div>
                          <div className="text-[10px] text-muted-foreground">{ana.model}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{ana.department}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{ana.dailyTestVolume} Tests/Day</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{ana.lastCalibrationDate}</TableCell>
                        <TableCell className="font-mono text-xs text-foreground font-semibold">{ana.nextCalibrationDate}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ana.status === "Operational"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            }
                          >
                            {ana.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CRITICAL THRESHOLDS */}
        <TabsContent value="thresholds" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Critical Panic-Value Threshold Configuration</CardTitle>
              <CardDescription className="text-xs">
                Physiological panic-value triggers requiring immediate emergency clinician notification.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Parameter</TableHead>
                      <TableHead className="text-xs font-bold">Low Panic Trigger</TableHead>
                      <TableHead className="text-xs font-bold">High Panic Trigger</TableHead>
                      <TableHead className="text-xs font-bold">Unit</TableHead>
                      <TableHead className="text-xs font-bold">Applies To</TableHead>
                      <TableHead className="text-xs font-bold">Last Audited By</TableHead>
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {thresholds.map((th) => (
                      <TableRow key={th.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{th.testName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{th.testCode}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-destructive">
                          {th.lowPanic > 0 ? `< ${th.lowPanic}` : "N/A"}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-destructive">
                          &gt; {th.highPanic}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{th.unit}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {th.appliesTo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>{th.auditedBy}</div>
                          <div className="text-[10px] font-mono">{new Date(th.lastAuditedAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold"
                            onClick={() => handleOpenThreshold(th)}
                          >
                            Edit &amp; Audit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: REJECTION REASONS */}
        <TabsContent value="rejection" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Standardized Specimen Rejection Codes</CardTitle>
              <CardDescription className="text-xs">
                Managed standardized root-cause reasons for specimens failing quality control at phlebotomy/intake.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Code</TableHead>
                      <TableHead className="text-xs font-bold">Standardized Rejection Reason</TableHead>
                      <TableHead className="text-xs font-bold">Category</TableHead>
                      <TableHead className="text-xs font-bold">Automated Corrective Protocol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectionReasons.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-destructive">
                          {r.code}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-foreground">
                          {r.reason}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {r.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.standardAction}
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

      {/* Add Test Modal */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveTest}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" /> Register Investigation Formulary Item
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add an investigation SKU with reference ranges and billing tariff linkage.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="t-name">Test / Panel Name *</Label>
                <Input
                  id="t-name"
                  required
                  placeholder="e.g. Thyroid Profile Total (T3, T4, TSH)"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="t-code">Test Code</Label>
                  <Input
                    id="t-code"
                    placeholder="e.g. LAB-THY-01"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="t-dept">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="t-dept" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hematology">Hematology</SelectItem>
                      <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                      <SelectItem value="Immunoassay">Immunoassay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="t-samp">Specimen Type</Label>
                  <Input
                    id="t-samp"
                    required
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="t-unit">Unit</Label>
                  <Input
                    id="t-unit"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="t-range">Reference Range String</Label>
                <Input
                  id="t-range"
                  required
                  placeholder="e.g. TSH: 0.35 - 4.94 uIU/mL"
                  value={referenceRange}
                  onChange={(e) => setReferenceRange(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="t-tar">Billing Tariff ID</Label>
                  <Input
                    id="t-tar"
                    placeholder="e.g. TAR-LAB-THY"
                    value={tariffId}
                    onChange={(e) => setTariffId(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="t-price">Price (₹) *</Label>
                  <Input
                    id="t-price"
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setTestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Register in Catalog
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Critical Threshold Modal */}
      <Dialog open={thresholdModalOpen} onOpenChange={setThresholdModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveThreshold}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-5 w-5 text-destructive" /> Audit Critical Value Thresholds
              </DialogTitle>
              <DialogDescription className="text-xs">
                Modify panic boundaries for {selectedThreshold?.testName} ({selectedThreshold?.unit}).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="th-low">Low Panic Boundary</Label>
                  <Input
                    id="th-low"
                    type="number"
                    step="0.1"
                    required
                    value={lowPanic}
                    onChange={(e) => setLowPanic(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="th-high">High Panic Boundary</Label>
                  <Input
                    id="th-high"
                    type="number"
                    step="0.1"
                    required
                    value={highPanic}
                    onChange={(e) => setHighPanic(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="th-aud">Authorizing Clinical Pathologist *</Label>
                <Input
                  id="th-aud"
                  required
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                />
              </div>

              <div className="p-2.5 rounded-md border border-destructive/30 bg-destructive/5 text-destructive text-[11px]">
                Quality Governance: Modifying panic thresholds alters emergency alerts hospital-wide. This change is permanently recorded in the audit trail.
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setThresholdModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="destructive">
                Audit &amp; Save Thresholds
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
