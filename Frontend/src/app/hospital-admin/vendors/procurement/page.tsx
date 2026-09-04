"use client";

import { useState } from "react";
import { Boxes, MoreHorizontal, Plus } from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { Toolbar } from "@/hospital-admin/components/shared/toolbar";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { procurementRequests } from "@/hospital-admin/lib/mock-data/vendors";
import { formatDate } from "@/hospital-admin/lib/utils";

const urgencyVariant: Record<string, "muted" | "warning" | "destructive"> = {
  normal: "muted",
  urgent: "warning",
  critical: "destructive",
};

export default function ProcurementPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const filtered = procurementRequests.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Procurement Requests"
        description="Request → Quote → Order → Delivery workflow for hospital/clinic procurement."
        crumbs={[{ label: "Network" }, { label: "Vendors", href: "/hospital-admin/vendors" }, { label: "Procurement" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  toast({ title: "Procurement request created", description: "Eligible vendors have been notified." });
                }}
              >
                <DialogHeader>
                  <DialogTitle>Create procurement request</DialogTitle>
                  <DialogDescription>Eligible verified vendors matching category and service area are notified.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="pr-title">Requirement title</Label>
                    <Input id="pr-title" placeholder="e.g. Cardiac Monitor - 2 units" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="pr-category">Category</Label>
                      <Select defaultValue="Consumables">
                        <SelectTrigger id="pr-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Consumables">Consumables</SelectItem>
                          <SelectItem value="Implants">Implants</SelectItem>
                          <SelectItem value="Medical Equipment">Medical Equipment</SelectItem>
                          <SelectItem value="PPE">PPE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="pr-qty">Quantity</Label>
                      <Input id="pr-qty" type="number" min={1} defaultValue={1} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="pr-date">Required by</Label>
                      <Input id="pr-date" type="date" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="pr-urgency">Urgency</Label>
                      <Select defaultValue="normal">
                        <SelectTrigger id="pr-urgency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="pr-spec">Specification / notes</Label>
                    <Textarea id="pr-spec" placeholder="Technical requirements, acceptable alternatives..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Publish request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Toolbar searchValue={search} onSearchChange={setSearch} placeholder="Search procurement requests" />

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <EmptyState icon={Boxes} title="No procurement requests found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Required By</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Quotes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{r.title}</p>
                    {r.linkedCase && <p className="text-xs text-muted-foreground">Linked: {r.linkedCase}</p>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.category}</TableCell>
                  <TableCell className="text-sm">{r.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{formatDate(r.requiredBy)}</TableCell>
                  <TableCell>
                    <Badge variant={urgencyVariant[r.urgency]}>{r.urgency}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.quotesReceived}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast({ title: "Quotes opened" })}>
                          Compare quotes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: "Request closed" })}>Close request</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
