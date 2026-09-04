"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  Award,
  Building2,
  CalendarClock,
  FileCheck2,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Separator } from "@/hospital-admin/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { appointments } from "@/hospital-admin/lib/mock-data/appointments";
import { doctors } from "@/hospital-admin/lib/mock-data/doctors";
import { formatCurrency, formatDate, getInitials } from "@/hospital-admin/lib/utils";

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const doctor = doctors.find((d) => d.id === params.id);
  if (!doctor) notFound();

  const doctorAppointments = appointments.filter((a) => a.doctorId === doctor.id);

  return (
    <div>
      <PageHeader
        title={doctor.name}
        crumbs={[{ label: "Doctors", href: "/hospital-admin/doctors" }, { label: doctor.name }]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/hospital-admin/appointments">
                <CalendarClock /> View schedule
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => {}}>
              Suspend affiliation
            </Button>
            <Button>Edit profile</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />
              <AvatarFallback className="text-lg">{getInitials(doctor.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-lg font-semibold">{doctor.name}</h2>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={doctor.status} />
              <StatusBadge status={doctor.availability} />
              {doctor.verified && (
                <Badge variant="info" dot>
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
            <div className="w-full rounded-lg border border-border bg-secondary/40 p-3 text-left text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Professional profile</p>
              <p className="mt-1">{doctor.subSpecialty} · {doctor.department}</p>
              <p>{doctor.languages.join(" · ")}</p>
            </div>
            <Separator />
            <div className="w-full space-y-3 text-left">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{doctor.qualification}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="font-display text-xl font-semibold">{doctor.experienceYears} yrs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Patients</p>
                <p className="font-display text-xl font-semibold">{doctor.totalPatients.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="flex items-center gap-1 font-display text-xl font-semibold">
                  <Star className="h-4 w-4 fill-warning text-warning" /> {doctor.rating}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Consultation Fee</p>
                <p className="font-display text-xl font-semibold">{formatCurrency(doctor.consultationFee)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registration & verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Registration No.</p>
                <p className="font-mono text-sm text-muted-foreground">{doctor.registrationNo}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Hospital verified: {doctor.verification.hospitalVerified ? "Yes" : "No"}</Badge>
                <Badge variant="secondary">Platform verified: {doctor.verification.platformVerified ? "Yes" : "No"}</Badge>
                <Badge variant="secondary">Public profile: {doctor.publicProfile.published ? "Published" : "Hidden"}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Doctor on Qlyno since {formatDate(doctor.createdAt)}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
              <TabsTrigger value="public">Public profile</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Qualifications</p>
                    <p className="mt-1 text-sm font-medium">{doctor.qualification}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Services</p>
                    <p className="mt-1 text-sm font-medium">{doctor.services.join(" · ")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Consultation mode</p>
                    <p className="mt-1 text-sm font-medium">{doctor.consultationSettings.visitMode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hospital-specific rules</p>
                    <p className="mt-1 text-sm font-medium">{doctor.consultationSettings.slotsPerDay} slots / day · {doctor.consultationFee ? formatCurrency(doctor.consultationFee) : "Fee configured"}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="verification">
              <Card>
                <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <FileCheck2 className="h-4 w-4 text-primary" /> Verification status: {doctor.verification.status}
                  </div>
                  <p>Hospital verification is separate from platform verification. Documents submitted by the doctor are reviewed by the hospital and then by Qlyno policy checks.</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {doctor.verification.documents.map((doc) => <li key={doc}>{doc}</li>)}
                  </ul>
                  {doctor.verification.pendingDocuments.length > 0 && (
                    <div className="rounded-md border border-dashed border-warning/60 bg-warning/5 p-3">
                      <p className="font-medium text-foreground">Pending documents</p>
                      <ul className="mt-2 list-disc pl-5">
                        {doctor.verification.pendingDocuments.map((doc) => <li key={doc}>{doc}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="schedule">
              <Card>
                <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Duty hours</p>
                    <p className="mt-1 text-sm font-medium">{doctor.schedule.dutyHours}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency / on-call</p>
                    <p className="mt-1 text-sm font-medium">{doctor.schedule.emergencyOnCall ? "On-call enabled" : "Not assigned for emergency coverage"}</p>
                  </div>
                  {doctor.schedule.leaveWindow && (
                    <div>
                      <p className="text-xs text-muted-foreground">Leave window</p>
                      <p className="mt-1 text-sm font-medium">{doctor.schedule.leaveWindow}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Availability note</p>
                    <p className="mt-1 text-sm font-medium">{doctor.schedule.availability}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="access">
              <Card>
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="mt-1 text-sm font-medium">{doctor.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Privileges</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {doctor.privileges.map((priv) => (
                        <Badge key={priv} variant="secondary">{priv}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned clinic / hospital location</p>
                    <p className="mt-1 text-sm font-medium">{doctor.location}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="public">
              <Card>
                <CardContent className="space-y-4 p-5 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span>Published in Qlyno search</span>
                    <StatusBadge status={doctor.publicProfile.published ? "active" : "inactive"} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span>Searchable by patients</span>
                    <StatusBadge status={doctor.publicProfile.searchable ? "active" : "inactive"} />
                  </div>
                  <p>Verified doctors affiliated with the hospital can appear in public search subject to publication rules.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="appointments">
              <Card>
                <CardContent className="p-0">
                  {doctorAppointments.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                      <Users className="h-6 w-6" />
                      No appointments recorded for this doctor yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {doctorAppointments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.patientName}</TableCell>
                            <TableCell>{formatDate(a.date)}</TableCell>
                            <TableCell className="font-mono text-xs">{a.time}</TableCell>
                            <TableCell>{a.type}</TableCell>
                            <TableCell>
                              <StatusBadge status={a.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
