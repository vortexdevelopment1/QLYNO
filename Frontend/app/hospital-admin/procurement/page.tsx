"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { Plus, PackageSearch, AlertCircle, ShoppingCart } from "lucide-react";

import { Button } from "@/hospital-admin/components/ui/button";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { RootState } from "@/hospital-admin/store/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Label } from "@/hospital-admin/components/ui/label";

const STATUS_COLORS: Record<string, string> = {
  'Draft': 'bg-muted text-muted-foreground',
  'Submitted': 'bg-info/10 text-info',
  'Quotes Collecting': 'bg-warning/20 text-warning-foreground',
  'Under Review': 'bg-info/20 text-info',
  'Approved': 'bg-success/20 text-success',
  'Rejected': 'bg-destructive/20 text-destructive',
  'Ordered': 'bg-primary/20 text-primary',
  'Fulfilled': 'bg-success/20 text-success',
  'Closed': 'bg-muted text-muted-foreground',
};

export default function ProcurementListPage() {
  const requests = useSelector((state: RootState) => state.procurement.requests);
  const vendors = useSelector((state: RootState) => state.procurement.vendors);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("All");

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== "All" && req.status !== filterStatus) return false;
    if (filterCategory !== "All" && req.category !== filterCategory) return false;
    if (filterDepartment !== "All" && req.department !== filterDepartment) return false;
    return true;
  });

  const getStalledAlert = (req: any) => {
    if (req.status === 'Quotes Collecting' && req.quotes.length === 0) {
      const hoursWaiting = (Date.now() - new Date(req.createdAt).getTime()) / 3600000;
      if (hoursWaiting > 48) {
        return <Badge variant="destructive" className="ml-2 flex items-center gap-1 text-[10px]"><AlertCircle className="h-3 w-3"/> Stalled {'>'} 48h</Badge>;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement Management"
        description="End-to-end lifecycle tracking for hospital requests, quotes, orders, and deliveries."
        crumbs={[{ label: "Hospital Operations" }, { label: "Procurement" }]}
        actions={
          <div className="flex gap-3">
            <Link href="/hospital-admin/procurement/vendors">
              <Button variant="outline">Vendor Network</Button>
            </Link>
            <Link href="/hospital-admin/procurement/deliveries">
              <Button variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" /> Delivery Tracking
              </Button>
            </Link>
            <Link href="/hospital-admin/procurement/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Request
              </Button>
            </Link>
          </div>
        }
      />

      <div className="bg-card border border-border rounded-xl p-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="grid gap-1.5 w-48">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Quotes Collecting">Quotes Collecting</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 w-48">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="implant">Implant</SelectItem>
                <SelectItem value="consumable">Consumable</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 w-48">
            <Label className="text-xs text-muted-foreground">Department</Label>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                <SelectItem value="Radiology">Radiology</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Item / Category</TableHead>
                <TableHead>Linked Case</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map(req => {
                const selectedQuote = req.quotes.find(q => q.status === 'Selected');
                const vendor = selectedQuote ? vendors.find(v => v.id === selectedQuote.vendorId)?.name : 'TBD';

                return (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Link href={`/hospital-admin/procurement/${req.id}`} className="font-medium text-primary hover:underline flex items-center gap-2">
                        <PackageSearch className="h-4 w-4 text-muted-foreground" />
                        {req.id}
                      </Link>
                    </TableCell>
                    <TableCell suppressHydrationWarning className="text-muted-foreground text-sm">
                      {format(new Date(req.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{req.item}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">{req.category} · {req.department}</div>
                    </TableCell>
                    <TableCell>
                      {req.linkedCaseId ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{req.linkedCaseId}</span>
                          {req.linkedPatientId && <span className="text-xs text-muted-foreground">{req.linkedPatientId}</span>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{vendor}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant="outline" className={`border-0 ${STATUS_COLORS[req.status]}`}>
                          {req.status}
                        </Badge>
                        {getStalledAlert(req)}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No procurement requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
