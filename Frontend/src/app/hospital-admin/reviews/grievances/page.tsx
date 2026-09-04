"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  ArrowUpRight,
  AlertTriangle,
  User,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { ReviewsNav } from "@/hospital-admin/components/reviews/reviews-nav";
import { CreateGrievanceModal } from "@/hospital-admin/components/reviews/CreateGrievanceModal";
import { ResolveGrievanceModal } from "@/hospital-admin/components/reviews/ResolveGrievanceModal";
import {
  createGrievanceCase,
  resolveGrievanceCase,
  escalateGrievanceTier,
} from "@/hospital-admin/store/slices/patientReviewsSlice";
import { GrievanceCase, GrievanceSeverity, GrievanceStatus } from "@/hospital-admin/lib/types/patient-reviews";
import { mockGrievanceCases } from "@/hospital-admin/lib/mock-data/patient-reviews";

export default function GrievanceDeskPage() {
  const dispatch = useDispatch<AppDispatch>();
  const grievances = useSelector((s: RootState) => s.patientReviews?.grievances || mockGrievanceCases);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCaseForResolution, setSelectedCaseForResolution] =
    useState<GrievanceCase | null>(null);

  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      g.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || g.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === "all" || g.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSeverity =
      severityFilter === "all" || g.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesSeverity;
  });

  const handleCreate = (newCase: GrievanceCase) => {
    dispatch(createGrievanceCase(newCase));
  };

  const handleResolve = (payload: {
    caseId: string;
    resolutionNotes: string;
    resolvedBy: string;
    patientCallbackConfirmed: boolean;
  }) => {
    dispatch(resolveGrievanceCase(payload));
  };

  const handleEscalateTier = (caseId: string, currentTier: GrievanceCase["escalationTier"]) => {
    const nextTier =
      currentTier === "Tier 1 - Ward Incharge"
        ? "Tier 2 - Medical Superintendent"
        : "Tier 3 - Grievance Committee";

    const nextAssignee =
      nextTier === "Tier 2 - Medical Superintendent"
        ? "Dr. Farooq Abdullah (Med Supt)"
        : "Hospital Grievance & Ethics Committee";

    dispatch(
      escalateGrievanceTier({
        caseId,
        targetTier: nextTier,
        reassignedTo: nextAssignee,
      })
    );
  };

  const getSeverityBadge = (sev: GrievanceSeverity) => {
    switch (sev) {
      case "Critical":
        return <Badge variant="destructive" className="text-[10px]">Critical (6h SLA)</Badge>;
      case "High":
        return <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">High (24h SLA)</Badge>;
      case "Medium":
        return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">Medium (48h SLA)</Badge>;
      case "Low":
        return <Badge variant="secondary" className="text-[10px]">Low (72h SLA)</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                Quality & Redressal
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Patient Grievance Resolution Desk
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Multi-tier escalation tracker for OPD, billing, nursing, and clinical care concerns (routed via Module 16 pattern).
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-8 gap-1 text-xs bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Grievance Case
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <ReviewsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by case ID, patient UHID, description, or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className="h-8 text-xs"
              >
                All ({grievances.length})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "open" ? "default" : "outline"}
                onClick={() => setStatusFilter("open")}
                className="h-8 text-xs"
              >
                Open
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "in progress" ? "default" : "outline"}
                onClick={() => setStatusFilter("in progress")}
                className="h-8 text-xs"
              >
                In Progress
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "escalated" ? "default" : "outline"}
                onClick={() => setStatusFilter("escalated")}
                className="h-8 text-xs"
              >
                Escalated
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "resolved" ? "default" : "outline"}
                onClick={() => setStatusFilter("resolved")}
                className="h-8 text-xs"
              >
                Resolved
              </Button>
            </div>
          </div>
        </div>

        {/* Grievance Cases List */}
        <div className="space-y-4">
          {filteredGrievances.map((g) => {
            const isResolved = g.status === "Resolved";

            return (
              <Card
                key={g.id}
                className={`border-border/80 shadow-sm bg-card transition-all ${
                  g.isOverdue && !isResolved
                    ? "border-rose-500/50 ring-1 ring-rose-500/20"
                    : ""
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] font-bold">
                          {g.id}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {g.category}
                        </Badge>
                        {getSeverityBadge(g.severity)}
                        <Badge
                          className={`text-[10px] ${
                            g.status === "Resolved"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : g.status === "Escalated"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                          }`}
                        >
                          {g.status}
                        </Badge>
                        {g.isOverdue && !isResolved && (
                          <Badge variant="destructive" className="text-[10px] animate-pulse">
                            SLA Overdue
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-sm font-semibold mt-2 text-foreground flex items-center gap-2">
                        <span>{g.patientName}</span>
                        <span className="text-xs font-mono font-normal text-muted-foreground">
                          ({g.patientId})
                        </span>
                      </CardTitle>
                    </div>

                    <div className="text-right text-[11px] text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono">{g.patientPhone}</span>
                      </div>
                      <div>
                        <span>SLA Target: </span>
                        <span className="font-mono">{g.slaDeadline}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                    {g.description}
                  </p>

                  {/* Multi-Tier Escalation Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground">Escalation Tier:</span>
                      <Badge variant="outline" className="text-[10px] bg-muted/50">
                        {g.escalationTier}
                      </Badge>
                      <span>•</span>
                      <span>Assigned to: <strong className="text-foreground">{g.assignedTo}</strong></span>
                    </div>

                    <span className="text-[10px] text-muted-foreground">
                      Logged: {g.createdAt}
                    </span>
                  </div>

                  {/* Resolution Box if resolved */}
                  {isResolved && g.resolutionNotes && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-emerald-700 dark:text-emerald-300 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Resolution & CAPA Actions Signed Off by {g.resolvedBy}</span>
                        </div>
                        <span className="font-mono text-muted-foreground text-[10px]">{g.resolvedAt}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{g.resolutionNotes}</p>
                      {g.patientCallbackConfirmed && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          ✓ Patient callback confirmed and grievance acknowledged as resolved.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isResolved && (
                    <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-2.5">
                      {g.escalationTier !== "Tier 3 - Grievance Committee" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEscalateTier(g.id, g.escalationTier)}
                          className="h-7 text-xs gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          Escalate to Next Tier
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => setSelectedCaseForResolution(g)}
                        className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Resolve Grievance
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <CreateGrievanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <ResolveGrievanceModal
        isOpen={!!selectedCaseForResolution}
        onClose={() => setSelectedCaseForResolution(null)}
        grievance={selectedCaseForResolution}
        onResolve={handleResolve}
      />
    </div>
  );
}
