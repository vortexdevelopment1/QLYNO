"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Hourglass,
  Layers,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingCart,
  Truck,
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
import { PharmacyNav } from "@/hospital-admin/components/pharmacy/pharmacy-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockPharmacyPurchaseOrders } from "@/hospital-admin/lib/mock-data/pharmacy-extended-operations";
import { PharmacyPurchaseOrder } from "@/hospital-admin/lib/types";
import { formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacyPendingOrdersPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [orders, setOrders] = useState<PharmacyPurchaseOrder[]>(mockPharmacyPurchaseOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Receive Modal State
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PharmacyPurchaseOrder | null>(null);
  const [receiverName, setReceiverName] = useState("Rekha Joshi (Chief Pharmacist)");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.medicineName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReceive = (po: PharmacyPurchaseOrder) => {
    setSelectedPO(po);
    setReceiveModalOpen(true);
  };

  const handleConfirmReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedPO.id
          ? {
              ...o,
              status: "Received" as const,
              receivedAt: new Date().toISOString(),
              receivedBy: receiverName,
            }
          : o
      )
    );

    toast({
      title: "Purchase Order Received & Stocked In",
      description: `${selectedPO.poNumber} verified. Inventory replenished with ${selectedPO.items.length} line items. (${DELEGATION_STRING})`,
    });

    setReceiveModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Pharmacy Procurement Lens &amp; Pending Orders"
          description="Inbound supplier shipments, PO tracking, and 1-click inventory stock-in verification."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Pending Orders" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading pending procurement orders...
        </div>
      </div>
    );
  }

  const dispatchedCount = orders.filter((o) => o.status === "Dispatched").length;
  const delayedCount = orders.filter((o) => o.status === "Delayed").length;
  const orderedCount = orders.filter((o) => o.status === "Ordered").length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Pharmacy Procurement Lens &amp; Pending Orders"
        description="Inbound supplier shipments, PO tracking, and 1-click inventory stock-in verification."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Pending Orders" }]}
        actions={
          <Link href="/hospital-admin/procurement/create">
            <Button size="sm" className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Create New Purchase Order
            </Button>
          </Link>
        }
      />

      <PharmacyNav />

      {/* Scope Indicator & Procurement Integration */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Inbound Pharmacy Receiving Dock" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Truck className="h-3.5 w-3.5 text-primary" />
          <span>Integration: Pharmacy-filtered lens on hospital-wide procurement system — no duplicate order silos</span>
        </div>
      </div>

      {/* Delayed PO Warning */}
      {delayedCount > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/10 shadow-xs">
          <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-300">
                  SHIPMENT DELAY ALERT: {delayedCount} Inbound Purchase Order(s) Overdue
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Critical cold-chain biologicals and ICU infusions are past expected delivery window. Vendor follow-up initiated.
                </p>
              </div>
            </div>
            <Link href="/hospital-admin/pharmacy/suppliers">
              <Button size="sm" variant="destructive" className="text-xs font-semibold shrink-0">
                Contact Vendor
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">In Transit (Dispatched)</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{dispatchedCount} Orders</p>
          <span className="text-[10px] text-primary font-medium">Expected in &lt;24 hours</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Awaiting Supplier Dispatch</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{orderedCount} Orders</p>
          <span className="text-[10px] text-amber-600 font-medium">Processing with distributor</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Delayed Shipments</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{delayedCount} Orders</p>
          <span className="text-[10px] text-rose-600 font-medium">Logistics escalation active</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Inbound Pipeline</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">
            ₹{orders.filter((o) => o.status !== "Received").reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-muted-foreground">Committed procurement value</span>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Pharmacy Purchase Orders Pipeline</CardTitle>
              <CardDescription className="text-xs">
                Real-time procurement tracking with batch allocations and receiving verification.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search PO number or vendor..."
                  className="pl-8 text-xs h-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] text-xs h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Dispatched">Dispatched</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[140px]">PO # &amp; Date</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Supplier &amp; Contact</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Ordered Line Items</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Exp. Delivery</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">PO Value</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[130px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((o) => (
                  <TableRow key={o.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-primary">{o.poNumber}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {formatDateTime(o.orderedAt)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{o.supplierName}</div>
                      <div className="text-[10px] text-muted-foreground">{o.supplierContact}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-foreground line-clamp-2">
                        {o.items.map((i) => `${i.medicineName} (${i.orderedQuantity}x)`).join(", ")}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatDateTime(o.expectedDelivery)}
                    </TableCell>

                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      ₹{o.totalAmount.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          o.status === "Received"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : o.status === "Dispatched"
                            ? "bg-primary/15 text-primary border-primary/30 text-[10px]"
                            : o.status === "Delayed"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] animate-pulse"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {o.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {o.status === "Received" ? (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Stocked by {o.receivedBy?.split(" ")[0]}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold bg-primary text-primary-foreground gap-1"
                          onClick={() => handleOpenReceive(o)}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Receive Stock
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

      {/* RECEIVE STOCK IN MODAL */}
      <Dialog open={receiveModalOpen} onOpenChange={setReceiveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmReceive}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Stock In Purchase Order #{selectedPO?.poNumber}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Confirm receipt and physically add items to hospital master formulary stock.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Vendor: <strong>{selectedPO?.supplierName}</strong></span>
                  <span className="font-mono font-bold">₹{selectedPO?.totalAmount.toLocaleString()}</span>
                </div>
                <div className="pt-1">
                  <span className="font-semibold block">Inbound SKUs to Stock In:</span>
                  {selectedPO?.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-muted-foreground text-[10px]">
                      <span>• {i.medicineName}</span>
                      <span className="font-mono font-semibold text-foreground">+{i.orderedQuantity} units</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="rec-name">Receiving Pharmacist *</Label>
                <Input
                  id="rec-name"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setReceiveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Confirm &amp; Update Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
