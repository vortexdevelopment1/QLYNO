"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Users,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { CommunicationNav } from "@/hospital-admin/components/care-coordination/communication/communication-nav";
import { AddDoctorNoteModal } from "@/hospital-admin/components/care-coordination/communication/AddDoctorNoteModal";
import { mockClinicalNotes } from "@/hospital-admin/lib/mock-data/communication-hub";
import { ClinicalNote } from "@/hospital-admin/lib/types";

export default function DoctorNotesPage() {
  const [notes, setNotes] = useState<ClinicalNote[]>(mockClinicalNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const filtered = notes.filter((note) => {
    const matchesSearch =
      note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.patientUhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.authorDoctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.noteText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.noteId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || note.priority.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                Clinical Handoff
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Doctor Notes & Care Team Handoffs
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Multidisciplinary notes, shift handovers, and role-restricted clinical instructions.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsNoteOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Doctor Note
          </Button>
        </div>
      </div>

      <CommunicationNav unreadChatCount={3} activeBroadcastCount={1} pendingRemindersCount={8} />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Open Notes
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{notes.length}</span>
              <p className="mt-1 text-[11px] text-muted-foreground">Visible to assigned care teams</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Urgent
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">
                {notes.filter((n) => n.priority === "Urgent").length}
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground">Requires same-shift acknowledgement</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Restricted Visibility
              </CardTitle>
              <Lock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">
                {notes.filter((n) => n.visibility === "Specific Recipients").length}
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground">Role-limited clinical instructions</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Clinical Note Feed
                </CardTitle>
                <CardDescription className="text-xs">
                  Read receipts are recorded against each care-team recipient.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search patient, doctor, note..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All priorities</SelectItem>
                    <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
                    <SelectItem value="routine" className="text-xs">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No clinical notes match your filters.</p>
            ) : (
              filtered.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-border/80 bg-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{note.patientName}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{note.patientUhid}</span>
                        <Badge variant="outline" className="text-[10px]">{note.noteId}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {note.authorDoctorName} • {note.doctorSpecialty} • {note.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {note.priority === "Urgent" ? (
                        <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
                          Urgent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Routine</Badge>
                      )}
                      {note.visibility === "Care Team" ? (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Users className="h-3 w-3" /> Care Team
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Lock className="h-3 w-3" /> Restricted
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-foreground">{note.noteText}</p>
                  {note.recipientRoles && note.recipientRoles.length > 0 && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Recipients: {note.recipientRoles.join(", ")}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {note.readBy.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground">No read receipts yet</span>
                    ) : (
                      note.readBy.map((reader) => (
                        <Badge key={reader.staffId} variant="outline" className="text-[10px] font-normal">
                          {reader.staffName} ({reader.staffRole}) • {reader.readAt}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <AddDoctorNoteModal
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        onNoteCreated={(note) => setNotes((prev) => [note, ...prev])}
      />
    </div>
  );
}
