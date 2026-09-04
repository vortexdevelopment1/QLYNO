"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Plus, Star, Truck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent } from "@/hospital-admin/components/ui/card";
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
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { Toolbar } from "@/hospital-admin/components/shared/toolbar";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { procurementRequests, vendors } from "@/hospital-admin/lib/mock-data/vendors";
import { formatCurrency, getInitials } from "@/hospital-admin/lib/utils";

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const filtered = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || v.status === status;
    return matchesSearch && matchesStatus;
  });

  const openRequests = procurementRequests.filter((r) => r.status === "open" || r.status === "closing-soon");

  return (
    <div>
      <PageHeader
        title="Vendor Network"
        description="Verified suppliers and service providers participating in your procurement network."
        crumbs={[{ label: "Network" }, { label: "Vendors" }]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/hospital-admin/vendors/procurement">Procurement Requests</Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus /> Invite Vendor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    toast({ title: "Vendor invited", description: "Onboarding & verification link sent." });
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>Invite a vendor</DialogTitle>
                    <DialogDescription>They&apos;ll complete KYC/verification before accessing requests.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="ven-name">Organization name</Label>
                      <Input id="ven-name" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <Label htmlFor="ven-email">Email</Label>
                        <Input id="ven-email" type="email" required />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="ven-phone">Phone</Label>
                        <Input id="ven-phone" required />
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="ven-category">Primary category</Label>
                      <Select defaultValue="Consumables">
                        <SelectTrigger id="ven-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Consumables">Consumables</SelectItem>
                          <SelectItem value="Implants">Implants</SelectItem>
                          <SelectItem value="Medicines">Medicines</SelectItem>
                          <SelectItem value="Equipment Maintenance">Equipment Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Send invitation</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {openRequests.length > 0 && (
        <Card className="mb-4 border-info/30 bg-info/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold">{openRequests.length} procurement request(s)</span> currently open for vendor
              quotes.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/hospital-admin/vendors/procurement">Review requests</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Toolbar searchValue={search} onSearchChange={setSearch} placeholder="Search vendors">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </Toolbar>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <EmptyState icon={Truck} title="No vendors found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Service Areas</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Active Orders</TableHead>
                <TableHead>Outstanding Payable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-lg">
                        <AvatarImage src={v.logoUrl} alt={v.name} className="rounded-lg" />
                        <AvatarFallback className="rounded-lg">{getInitials(v.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.contactPerson}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {v.categories.slice(0, 2).map((c) => (
                        <Badge key={c} variant="muted">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.serviceAreas.join(", ")}</TableCell>
                  <TableCell>
                    {v.rating > 0 ? (
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {v.rating}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not rated</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{v.activeOrders}</TableCell>
                  <TableCell className="text-sm">
                    {v.outstandingPayable > 0 ? formatCurrency(v.outstandingPayable) : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/hospital-admin/vendors/${v.id}`}>View profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: "Verification requested" })}>
                          Review verification
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => toast({ title: "Vendor suspended", description: v.name })}
                        >
                          Suspend vendor
                        </DropdownMenuItem>
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
