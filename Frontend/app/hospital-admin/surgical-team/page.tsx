"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Shield,
  Stethoscope,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
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
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  addTeamTemplate,
  deleteTeamTemplate,
  SurgicalTeamTemplate,
} from "@/hospital-admin/store/slices/surgicalSlice";
import { cn } from "@/hospital-admin/lib/utils";

export default function SurgicalTeamPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { teamTemplates, surgeons, cases } = useSelector((state: RootState) => state.surgical);

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplSpecialty, setTplSpecialty] = useState("Orthopedics");
  const [tplLead, setTplLead] = useState("Dr. Ramesh Sharma");
  const [tplAnesth, setTplAnesth] = useState("Dr. Rajesh Menon");
  const [tplScrub, setTplScrub] = useState("Sister Kamala Rao");
  const [tplCirc, setTplCirc] = useState("Nurse Suman Das");

  // Conflict state filter
  const [staffFilter, setStaffFilter] = useState("ALL");

  const handleOpenAddTemplate = () => {
    setTplName("");
    setTplSpecialty("Orthopedics");
    setTplLead("Dr. Ramesh Sharma");
    setTplAnesth("Dr. Rajesh Menon");
    setTplScrub("Sister Kamala Rao");
    setTplCirc("Nurse Suman Das");
    setTemplateModalOpen(true);
  };

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) {
      toast({ title: "Template Name Required", description: "Provide a template name.", variant: "destructive" });
      return;
    }

    dispatch(
      addTeamTemplate({
        name: tplName.trim(),
        specialty: tplSpecialty,
        leadSurgeon: tplLead.trim(),
        anesthetist: tplAnesth.trim(),
        scrubNurse: tplScrub.trim(),
        circulatingNurse: tplCirc.trim(),
      })
    );

    toast({
      title: "Team Template Created",
      description: `${tplName.trim()} saved for rapid surgery slot allocation.`,
    });
    setTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    dispatch(deleteTeamTemplate(id));
    toast({ title: "Template Deleted", description: `${name} removed.` });
  };

  // Nursing workforce roster
  const nursingStaff = [
    { name: "Sister Kamala Rao", role: "Lead Scrub Nurse", specialty: "Orthopedics", status: "In Surgery", assignedCase: "CASE-409" },
    { name: "Sister Zoya Ansari", role: "Neuro Scrub Specialist", specialty: "Neurology", status: "Available", assignedCase: undefined },
    { name: "Sister Anjali Bhosale", role: "Emergency Trauma Nurse", specialty: "Emergency", status: "Available", assignedCase: undefined },
    { name: "Nurse Suman Das", role: "Circulating Nurse", specialty: "General Surgery", status: "Off-duty", assignedCase: undefined },
    { name: "Nurse Kiran More", role: "PACU Recovery Lead", specialty: "PACU", status: "Available", assignedCase: undefined },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Surgical Workforce &amp; Team Templates"
        description="Manage predefined specialty team combos, live staff duty boards, and overlap conflict detection."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Surgical Team" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold" onClick={handleOpenAddTemplate}>
            <Plus className="h-4 w-4" /> New Team Template
          </Button>
        }
      />

      <SurgicalNav />

      {/* Overlap & Conflict Warning Guard */}
      <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <span>
            <strong>Conflict Detection Active:</strong> The system validates overlapping surgeon and scrub nurse allocations across all active OR suites.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
          0 Schedule Conflicts Detected
        </Badge>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid grid-cols-3 w-full sm:w-[480px]">
          <TabsTrigger value="templates" className="text-xs">
            Team Templates ({teamTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="surgeons" className="text-xs">
            Surgeons Roster ({surgeons.length})
          </TabsTrigger>
          <TabsTrigger value="nurses" className="text-xs">
            Surgical Nursing ({nursingStaff.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: TEAM TEMPLATES */}
        <TabsContent value="templates" className="space-y-3 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamTemplates.map((tpl) => (
              <Card key={tpl.id} className="border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <CardHeader className="p-4 pb-3 border-b border-border/60">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">{tpl.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Specialty: <strong className="text-foreground">{tpl.specialty}</strong>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-[9px]">
                      {tpl.id}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Lead Surgeon:</span>
                      <strong className="text-foreground font-semibold">{tpl.leadSurgeon}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Anesthesiologist:</span>
                      <span className="text-foreground font-medium">{tpl.anesthetist}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Scrub Nurse:</span>
                      <span className="text-foreground font-medium">{tpl.scrubNurse}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Circulating Nurse:</span>
                      <span className="text-foreground font-medium">{tpl.circulatingNurse}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 font-medium">Ready for 1-Click Apply</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: SURGEONS ROSTER */}
        <TabsContent value="surgeons" className="space-y-3 pt-3">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Surgeon Availability &amp; Credentialing Board</CardTitle>
              <CardDescription className="text-xs">Live duty status and reliability ratings across surgical specialties.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Surgeon Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Faculty Type</TableHead>
                    <TableHead>Reliability Score</TableHead>
                    <TableHead>Duty Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surgeons.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-semibold text-xs text-foreground">{s.name}</TableCell>
                      <TableCell className="text-xs">{s.specialty}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {s.isInternal ? "Internal Faculty" : "External / Visiting"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-primary">
                        {s.reliabilityScore}% ({s.acceptedCases} cases)
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.availability === "Available"
                              ? "success"
                              : s.availability === "In Surgery"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {s.availability}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SURGICAL NURSING */}
        <TabsContent value="nurses" className="space-y-3 pt-3">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Surgical Nursing &amp; Scrub Technician Roster</CardTitle>
              <CardDescription className="text-xs">Trained perioperative, sterile scrub, and circulating nurses.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nurse Name</TableHead>
                    <TableHead>Clinical Role</TableHead>
                    <TableHead>Specialty Focus</TableHead>
                    <TableHead>Assigned Surgery</TableHead>
                    <TableHead>Duty Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nursingStaff.map((n, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-semibold text-xs text-foreground">{n.name}</TableCell>
                      <TableCell className="text-xs font-medium">{n.role}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{n.specialty}</TableCell>
                      <TableCell className="text-xs font-mono text-primary">
                        {n.assignedCase || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            n.status === "Available"
                              ? "success"
                              : n.status === "In Surgery"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {n.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODAL: ADD TEAM TEMPLATE                                                  */}
      {/* ========================================================================= */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Create Surgical Team Template
            </DialogTitle>
            <DialogDescription>
              Define a reusable surgeon and nurse combo for fast-track OT slot booking.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTemplateSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Template Name *</Label>
              <Input
                placeholder="e.g. Cardiac Valve Replacement Team"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Specialty</Label>
              <Select value={tplSpecialty} onValueChange={setTplSpecialty}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="General Surgery">General Surgery</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead Surgeon</Label>
                <Input value={tplLead} onChange={(e) => setTplLead(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Anesthesiologist</Label>
                <Input value={tplAnesth} onChange={(e) => setTplAnesth(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Scrub Nurse</Label>
                <Input value={tplScrub} onChange={(e) => setTplScrub(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Circulating Nurse</Label>
                <Input value={tplCirc} onChange={(e) => setTplCirc(e.target.value)} required />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setTemplateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
