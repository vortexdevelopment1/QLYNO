"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Layers,
  Lock,
  MoreHorizontal,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { BillingStaffNav } from "@/hospital-admin/components/billing-staff/billing-staff-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  billingStaff as initialStaff,
  billingCounters as initialCounters,
  billingTransactions as initialTransactions,
} from "@/hospital-admin/lib/mock-data/staff";
import { BillingStaff, BillingCounter, BillingPermissions, BillingTransaction } from "@/hospital-admin/lib/types";
import { formatCurrency, getInitials } from "@/hospital-admin/lib/utils";

export default function BillingStaffPage() {
  const [mounted, setMounted] = useState(false);
  const [staffList, setStaffList] = useState<BillingStaff[]>(initialStaff);
  const [counters, setCounters] = useState<BillingCounter[]>(initialCounters);
  const [transactions, setTransactions] = useState<BillingTransaction[]>(initialTransactions);

  const [activeTab, setActiveTab] = useState("officers");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<BillingStaff | null>(null);

  // Form states
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffScope, setNewStaffScope] = useState("OPD Billing");
  const [newStaffCounter, setNewStaffCounter] = useState("CTR-01");

  // Permissions edit form
  const [maxRefund, setMaxRefund] = useState(5000);
  const [maxDiscount, setMaxDiscount] = useState(1000);
  const [allowOverride, setAllowOverride] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenPermissions = (staff: BillingStaff) => {
    setSelectedStaff(staff);
    setMaxRefund(staff.permissions?.maxRefundLimit || 5000);
    setMaxDiscount(staff.permissions?.maxDiscountLimit || 1000);
    setAllowOverride(staff.permissions?.supervisorOverride || false);
    setPermModalOpen(true);
  };

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaff.id
          ? {
              ...s,
              permissions: {
                maxRefundLimit: Number(maxRefund),
                maxDiscountLimit: Number(maxDiscount),
                permittedCategories: s.permissions?.permittedCategories || ["OPD", "Diagnostics"],
                supervisorOverride: allowOverride,
              },
            }
          : s
      )
    );

    toast({
      title: "Billing Permissions Updated",
      description: `Updated authorization thresholds for ${selectedStaff.name}. Logged in security audit trail.`,
    });
    setPermModalOpen(false);
  };

  const handleInviteStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOfficer: BillingStaff = {
      id: `bil_${Date.now().toString().slice(-3)}`,
      name: newStaffName,
      email: `${newStaffName.toLowerCase().replace(/\s+/g, ".")}@qlyno.health`,
      phone: "+91 98200 00000",
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      location: "Qlyno Multispecialty Hospital - Accounts",
      role: "Billing Staff",
      scopes: [newStaffScope],
      assignedCounterId: newStaffCounter,
      assignedCounterName: counters.find((c) => c.id === newStaffCounter)?.name,
      shift: "Morning",
      permissions: {
        maxRefundLimit: 5000,
        maxDiscountLimit: 1000,
        permittedCategories: [newStaffScope],
        supervisorOverride: false,
      },
      collectionsToday: 0,
      pendingInvoices: 0,
      collectionsByMode: { cash: 0, card: 0, upi: 0, insurance: 0 },
      discrepancyAmount: 0,
    };

    setStaffList((prev) => [newOfficer, ...prev]);
    toast({
      title: "Billing Officer Onboarded",
      description: `${newStaffName} assigned to ${newStaffScope}.`,
    });
    setInviteModalOpen(false);
    setNewStaffName("");
  };

  const handleToggleCounterStatus = (counterId: string) => {
    setCounters((prev) =>
      prev.map((c) => {
        if (c.id === counterId) {
          const nextStatus = c.status === "Open" ? "On Break" : c.status === "On Break" ? "Closed" : "Open";
          toast({
            title: "Counter Status Changed",
            description: `${c.name} is now ${nextStatus}.`,
          });
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const filteredStaff = staffList.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.scopes.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCollectionsToday = staffList.reduce((acc, s) => acc + s.collectionsToday, 0);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Billing Staff &amp; Counter Operations"
          description="Cashier management, counter allocations, permission limits, and daily collection reconciliation."
          crumbs={[{ label: "People & Staff" }, { label: "Billing Staff" }]}
        />
        <BillingStaffNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading billing operations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Billing Staff &amp; Counter Operations"
        description="Cashier management, counter allocations, permission limits, and daily collection reconciliation."
        crumbs={[{ label: "People & Staff" }, { label: "Billing Staff" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setInviteModalOpen(true)}>
            <Plus className="h-4 w-4" /> Onboard Billing Officer
          </Button>
        }
      />

      <BillingStaffNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Collections Today</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {formatCurrency(totalCollectionsToday)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Across all counters</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Billing Desks</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {counters.filter((c) => c.status === "Open").length} / {counters.length} Desks
          </p>
          <span className="text-[10px] text-primary font-medium">Open &amp; Cashiers Assigned</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Invoices</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {staffList.reduce((acc, s) => acc + s.pendingInvoices, 0)} Invoices
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting payment settlement</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Reconciliation Status</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">100% Balanced</p>
          <span className="text-[10px] text-cyan-600 font-medium">₹0 Discrepancy Flagged</span>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 border border-border">
          <TabsTrigger value="officers" className="text-xs">
            Billing Officers ({staffList.length})
          </TabsTrigger>
          <TabsTrigger value="counters" className="text-xs">
            Assigned Counters ({counters.length})
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs">
            Permissions Matrix
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs">
            Transactions &amp; Timeline
          </TabsTrigger>
          <TabsTrigger value="collections" className="text-xs">
            Collections &amp; Settlement
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Billing Officers Directory */}
        <TabsContent value="officers" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Billing Officers Directory</CardTitle>
              <CardDescription className="text-xs">
                Function-scoped personnel managing OPD, IPD, Insurance/TPA pre-auth, and refund counters.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by officer name or scope..."
                    className="pl-8 text-xs h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Officer</TableHead>
                      <TableHead className="text-xs font-bold">Functional Scope</TableHead>
                      <TableHead className="text-xs font-bold">Assigned Counter</TableHead>
                      <TableHead className="text-xs font-bold">Shift</TableHead>
                      <TableHead className="text-xs font-bold">Today&apos;s Collections</TableHead>
                      <TableHead className="text-xs font-bold">Refund Limit</TableHead>
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border">
                              <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                              <AvatarFallback className="text-xs font-bold">{getInitials(staff.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-xs text-foreground">{staff.name}</div>
                              <div className="text-[11px] text-muted-foreground">{staff.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {staff.scopes.map((scope, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px]">
                                {scope}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium">{staff.assignedCounterName || "Not Assigned"}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{staff.assignedCounterId}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            <Clock className="h-3 w-3 mr-1" /> {staff.shift || "Morning"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-emerald-600">
                          {formatCurrency(staff.collectionsToday)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-primary font-bold">
                          {formatCurrency(staff.permissions?.maxRefundLimit || 5000)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem onClick={() => handleOpenPermissions(staff)}>
                                <Lock className="h-3.5 w-3.5 mr-1" /> Configure Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setActiveTab("transactions")}>
                                <History className="h-3.5 w-3.5 mr-1" /> View Transactions
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Assigned Counters Registry */}
        <TabsContent value="counters" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Cashier Counters &amp; Desks Registry</CardTitle>
              <CardDescription className="text-xs">
                Physical counter assignments, operational statuses, and live cashier bindings per shift.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {counters.map((counter) => (
                  <Card key={counter.id} className="border-border shadow-xs bg-card">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                          {counter.id}
                        </span>
                        <CardTitle className="text-xs font-bold mt-0.5">{counter.name}</CardTitle>
                      </div>
                      <Badge
                        className={
                          counter.status === "Open"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : counter.status === "On Break"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {counter.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Functional Type:</span>
                        <span className="font-semibold text-foreground">{counter.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Assigned Cashier:</span>
                        <span className="font-semibold text-foreground">{counter.assignedStaffName || "None"}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Physical Location:</span>
                        <span className="font-medium text-[11px]">{counter.location}</span>
                      </div>
                      <div className="pt-2 border-t flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {counter.shift} Shift
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleToggleCounterStatus(counter.id)}
                        >
                          Toggle Status
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Permissions Matrix */}
        <TabsContent value="permissions" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Billing Permissions &amp; Authorization Caps</CardTitle>
              <CardDescription className="text-xs">
                Enforce maximum refund limits, discount approval thresholds, and supervisor overrides.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Billing Officer</TableHead>
                      <TableHead className="text-xs font-bold">Max Refund Cap</TableHead>
                      <TableHead className="text-xs font-bold">Max Discount Cap</TableHead>
                      <TableHead className="text-xs font-bold">Accessible Modules</TableHead>
                      <TableHead className="text-xs font-bold">Supervisor Override</TableHead>
                      <TableHead className="text-xs font-bold text-right">Edit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="text-xs font-semibold">{staff.name}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-rose-600">
                          {formatCurrency(staff.permissions?.maxRefundLimit || 5000)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-amber-600">
                          {formatCurrency(staff.permissions?.maxDiscountLimit || 1000)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(staff.permissions?.permittedCategories || ["OPD"]).map((cat, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {staff.permissions?.supervisorOverride ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                              Authorized
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              Standard
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => handleOpenPermissions(staff)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
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

        {/* Tab 4: Transactions & Timeline */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Transaction Ledger &amp; Lifecycle Timeline</CardTitle>
              <CardDescription className="text-xs">
                Chronological, timestamped record of invoices created, payments collected, and refunds processed.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Txn ID &amp; Time</TableHead>
                      <TableHead className="text-xs font-bold">Patient Details</TableHead>
                      <TableHead className="text-xs font-bold">Type &amp; Counter</TableHead>
                      <TableHead className="text-xs font-bold">Payment Mode</TableHead>
                      <TableHead className="text-xs font-bold">Amount</TableHead>
                      <TableHead className="text-xs font-bold">Lifecycle Status</TableHead>
                      <TableHead className="text-xs font-bold">Cashier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>
                          <div className="text-xs font-mono font-bold text-foreground">{txn.id}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(txn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold">{txn.patientName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{txn.patientId}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {txn.type}
                          </Badge>
                          <div className="text-[10px] text-muted-foreground">{txn.counterId}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {txn.paymentMode}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-xs font-mono font-bold ${
                            txn.type === "Refund" ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {txn.type === "Refund" ? `-${formatCurrency(txn.amount)}` : formatCurrency(txn.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                            {txn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{txn.billingOfficerName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Daily Collections & Settlement */}
        <TabsContent value="collections" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Daily Collections Breakdown by Payment Mode</CardTitle>
              <CardDescription className="text-xs">
                End-of-shift reconciliation per cashier and counter with discrepancy alerting.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Cashier</TableHead>
                      <TableHead className="text-xs font-bold">Counter</TableHead>
                      <TableHead className="text-xs font-bold">Cash</TableHead>
                      <TableHead className="text-xs font-bold">Card (POS)</TableHead>
                      <TableHead className="text-xs font-bold">UPI / QR</TableHead>
                      <TableHead className="text-xs font-bold">Insurance (TPA)</TableHead>
                      <TableHead className="text-xs font-bold">Total Shift Net</TableHead>
                      <TableHead className="text-xs font-bold">Discrepancy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="text-xs font-semibold">{staff.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{staff.assignedCounterId}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatCurrency(staff.collectionsByMode?.cash || 0)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatCurrency(staff.collectionsByMode?.card || 0)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatCurrency(staff.collectionsByMode?.upi || 0)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatCurrency(staff.collectionsByMode?.insurance || 0)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-emerald-600">
                          {formatCurrency(staff.collectionsToday)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                            ₹0 Balanced
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
      </Tabs>

      {/* Modal 1: Onboard Billing Officer */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleInviteStaffSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Onboard Billing Officer</DialogTitle>
              <DialogDescription className="text-xs">
                Assign a dedicated functional scope and cashier counter.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="officer-name">Full Name</Label>
                <Input
                  id="officer-name"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="officer-scope">Billing Functional Scope</Label>
                <Select value={newStaffScope} onValueChange={setNewStaffScope}>
                  <SelectTrigger id="officer-scope" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD Billing">OPD Billing</SelectItem>
                    <SelectItem value="IPD Billing">IPD Billing</SelectItem>
                    <SelectItem value="Insurance / TPA Desk">Insurance / TPA Desk</SelectItem>
                    <SelectItem value="Refund Desk">Refund Desk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="officer-ctr">Assigned Counter</Label>
                <Select value={newStaffCounter} onValueChange={setNewStaffCounter}>
                  <SelectTrigger id="officer-ctr" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {counters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm Onboarding
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Edit Billing Permissions */}
      <Dialog open={permModalOpen} onOpenChange={setPermModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSavePermissions}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Configure Billing Permissions</DialogTitle>
              <DialogDescription className="text-xs">
                Set financial authorization limits for {selectedStaff?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="max-refund">Maximum Refund Authorization Limit (₹)</Label>
                <Input
                  id="max-refund"
                  type="number"
                  required
                  value={maxRefund}
                  onChange={(e) => setMaxRefund(Number(e.target.value))}
                />
                <span className="text-[10px] text-muted-foreground">
                  Refunds exceeding this require supervisor step-up authorization.
                </span>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="max-discount">Maximum Discount Approval Limit (₹)</Label>
                <Input
                  id="max-discount"
                  type="number"
                  required
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/20">
                <div>
                  <div className="font-semibold">Supervisor Override Rights</div>
                  <div className="text-[10px] text-muted-foreground">Can authorize second-level exceptions</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowOverride}
                  onChange={(e) => setAllowOverride(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setPermModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Permissions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
