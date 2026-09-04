"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Star, Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { Toolbar } from "@/hospital-admin/components/shared/toolbar";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { doctors as initialDoctors } from "@/hospital-admin/lib/mock-data/doctors";
import { formatCurrency, getInitials } from "@/hospital-admin/lib/utils";

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [scheduleDoctor, setScheduleDoctor] = useState<any>(null);
  const [verifyDoctor, setVerifyDoctor] = useState<any>(null);
  const [suspendDoctor, setSuspendDoctor] = useState<any>(null);

  const specialties = useMemo(
    () => ["all", ...Array.from(new Set(initialDoctors.map((d) => d.specialty)))],
    []
  );

  const filtered = initialDoctors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.registrationNo.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialty === "all" || d.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  function handleAddDoctor(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    toast({ title: "Doctor invited", description: "An onboarding invite has been queued for delivery." });
  }

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Manage doctor profiles, specialties, availability and clinic assignments."
        crumbs={[{ label: "Care Delivery" }, { label: "Doctors" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddDoctor}>
                <DialogHeader>
                  <DialogTitle>Invite a new doctor</DialogTitle>
                  <DialogDescription>
                    They&apos;ll receive an onboarding link to verify credentials and set up their profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="doc-name">Full name</Label>
                    <Input id="doc-name" placeholder="Dr. Jane Doe" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="doc-email">Email</Label>
                      <Input id="doc-email" type="email" placeholder="jane@qlyno.health" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="doc-phone">Phone</Label>
                      <Input id="doc-phone" placeholder="+91 90000 00000" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="doc-specialty">Specialty</Label>
                      <Input id="doc-specialty" placeholder="Cardiology" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="doc-reg">Registration No.</Label>
                      <Input id="doc-reg" placeholder="MH-XXXX-00000" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="doc-department">Department</Label>
                      <Input id="doc-department" placeholder="Cardiology" defaultValue="Cardiology" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="doc-subspecialty">Sub-specialty</Label>
                      <Input id="doc-subspecialty" placeholder="Interventional Cardiology" />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="doc-clinic">Assigned hospital location</Label>
                    <Select defaultValue="main-campus">
                      <SelectTrigger id="doc-clinic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main-campus">Qlyno Multispecialty Hospital - Main Campus</SelectItem>
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

      <Toolbar searchValue={search} onSearchChange={setSearch} placeholder="Search doctors by name, specialty or registration no.">
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All specialties" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors match your filters"
            description="Try a different search term or clear the specialty filter."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Today</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doctor) => {
                const verification = doctor.verification ?? {
                  status: "pending",
                  hospitalVerified: false,
                  platformVerified: false,
                  documents: [],
                  pendingDocuments: [],
                };

                return (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <Link href={`/hospital-admin/doctors/${doctor.id}`} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />
                          <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground hover:text-primary">{doctor.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{doctor.registrationNo}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doctor.specialty}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doctor.department}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doctor.location}</TableCell>
                    <TableCell>
                      <StatusBadge status={doctor.availability} />
                    </TableCell>
                    <TableCell className="text-sm">{doctor.todayAppointments} appts</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {doctor.rating}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{formatCurrency(doctor.consultationFee)}</TableCell>
                    <TableCell>
                      <StatusBadge status={verification.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={doctor.status} />
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
                            <Link href={`/hospital-admin/doctors/${doctor.id}`}>View profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setScheduleDoctor(doctor)}>
                            Manage schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setVerifyDoctor(doctor)}
                          >
                            {doctor.verified ? "Re-verify credentials" : "Verify credentials"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setSuspendDoctor(doctor)}
                          >
                            Suspend access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {initialDoctors.length} doctors
      </p>
      <div className="mt-2">
        <Badge variant="outline" className="text-[11px]">Multi-doctor clinic model · Clinic → Doctors → Staff hierarchy</Badge>
      </div>

      {/* Action Modals */}
      {scheduleDoctor && (
        <Dialog open={!!scheduleDoctor} onOpenChange={() => setScheduleDoctor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Schedule - {scheduleDoctor.name}</DialogTitle>
              <DialogDescription>Configure available hours and clinic days.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label>Working Days</Label>
                <Input defaultValue="Monday - Friday" />
              </div>
              <div className="grid gap-1.5">
                <Label>Shift Timings</Label>
                <Input defaultValue="09:00 AM - 05:00 PM" />
              </div>
              <div className="grid gap-1.5">
                <Label>Consultation Duration (mins)</Label>
                <Input type="number" defaultValue="20" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDoctor(null)}>Cancel</Button>
              <Button onClick={() => {
                toast({ title: "Schedule updated", description: `Updated schedule for ${scheduleDoctor.name}` });
                setScheduleDoctor(null);
              }}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {verifyDoctor && (
        <Dialog open={!!verifyDoctor} onOpenChange={() => setVerifyDoctor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Credentials - {verifyDoctor.name}</DialogTitle>
              <DialogDescription>Review and approve medical credentials.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium text-sm">Medical License Registration</p>
                  <p className="text-xs text-muted-foreground">{verifyDoctor.registrationNo}</p>
                </div>
                <Badge variant={verifyDoctor.verified ? "default" : "secondary"}>
                  {verifyDoctor.verified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium text-sm">Board Certification</p>
                  <p className="text-xs text-muted-foreground">{verifyDoctor.specialty} Board</p>
                </div>
                <Badge variant="secondary">Pending Review</Badge>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyDoctor(null)}>Close</Button>
              <Button onClick={() => {
                toast({ title: "Credentials verified", description: `${verifyDoctor.name} has been verified.` });
                setVerifyDoctor(null);
              }}>Approve Verification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {suspendDoctor && (
        <Dialog open={!!suspendDoctor} onOpenChange={() => setSuspendDoctor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Suspend Doctor Access</DialogTitle>
              <DialogDescription>
                Are you sure you want to suspend {suspendDoctor.name}? They will immediately lose access to the hospital portal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label>Reason for suspension</Label>
                <Input placeholder="e.g. License expired, disciplinary action..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspendDoctor(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast({ title: "Doctor Suspended", description: `${suspendDoctor.name} has been suspended.` });
                setSuspendDoctor(null);
              }}>Confirm Suspension</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
