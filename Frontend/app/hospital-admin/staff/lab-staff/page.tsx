"use client";

import { useState } from "react";
import { Activity, MoreHorizontal, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
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
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { Toolbar } from "@/hospital-admin/components/shared/toolbar";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { labStaffList } from "@/hospital-admin/lib/mock-data/staff";
import { getInitials } from "@/hospital-admin/lib/utils";

export default function LabStaffPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const filtered = labStaffList.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Lab Staff"
        description="Pathologists, technicians, front desk and collection agents connected to your diagnostics network."
        crumbs={[{ label: "Clinic Staff" }, { label: "Lab Staff" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Add Lab Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  toast({ title: "Lab staff invited" });
                }}
              >
                <DialogHeader>
                  <DialogTitle>Add lab staff</DialogTitle>
                  <DialogDescription>Assign role and lab location.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="lab-name">Full name</Label>
                    <Input id="lab-name" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="lab-role">Role</Label>
                    <Select defaultValue="Lab Technician">
                      <SelectTrigger id="lab-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pathologist">Pathologist</SelectItem>
                        <SelectItem value="Lab Technician">Lab Technician</SelectItem>
                        <SelectItem value="Lab Front Desk">Lab Front Desk</SelectItem>
                        <SelectItem value="Collection Agent">Collection Agent</SelectItem>
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
        }
      />

      <Toolbar searchValue={search} onSearchChange={setSearch} placeholder="Search lab staff" />

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <EmptyState icon={Activity} title="No lab staff found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Lab Location</TableHead>
                <TableHead>Orders Handled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={l.avatarUrl} alt={l.name} />
                        <AvatarFallback>{getInitials(l.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{l.name}</p>
                        <p className="text-xs text-muted-foreground">{l.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.labLocation}</TableCell>
                  <TableCell className="text-sm">{l.ordersHandled.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={l.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast({ title: "Role updated" })}>Edit role</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast({ title: "Reassigned" })}>Reassign location</DropdownMenuItem>
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
