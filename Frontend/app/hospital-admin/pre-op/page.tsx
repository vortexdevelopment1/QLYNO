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
  ExternalLink,
  FileCheck,
  Filter,
  Layers,
  Search,
  Shield,
  Stethoscope,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { updateChecklistItem, ChecklistItemStatus } from "@/hospital-admin/store/slices/surgicalSlice";
import { cn } from "@/hospital-admin/lib/utils";

export default function PreOpBoardPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cases } = useSelector((state: RootState) => state.surgical);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Flatten all checklist items across all active cases
  const allItems = cases.flatMap((c) =>
    c.checklist.map((item) => ({
      ...item,
      caseId: c.id,
      patientName: c.patientName,
      procedureType: c.procedureType,
      department: c.department,
      caseStatus: c.status,
    }))
  );

  const filteredItems = allItems.filter((i) => {
    const matchesSearch =
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.caseId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const categories = [
    { key: "pre-op assessment", title: "Clinical Assessments & PAC", color: "text-blue-600 dark:text-blue-400" },
    { key: "investigations", title: "Diagnostics & Lab Investigations", color: "text-purple-600 dark:text-purple-400" },
    { key: "consent", title: "Informed Surgical & Legal Consent", color: "text-emerald-600 dark:text-emerald-400" },
    { key: "blood/implant/equipment", title: "Blood, Implants & Specialized Equipment", color: "text-amber-600 dark:text-amber-400" },
  ];

  const handleToggleStatus = (caseId: string, itemId: string, newStatus: ChecklistItemStatus) => {
    dispatch(updateChecklistItem({ caseId, itemId, status: newStatus }));
    toast({
      title: "Pre-Op Checklist Updated",
      description: `Item status set to ${newStatus}. Synced with Case ${caseId}.`,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Cross-Case Pre-Op Readiness Board"
        description="Hospital-wide clinical dependency tracking across all upcoming surgical cases to eliminate OR delays."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Pre-Op Board" }]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {allItems.filter((i) => i.status === "Done").length} / {allItems.length} Items Cleared
            </Badge>
          </div>
        }
      />

      <SurgicalNav />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patient, case ID or dependency..."
            className="pl-8 h-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs w-[160px]">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Missing">Missing / Blocker</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Waived - Emergency Override">Waived (Emergency)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4 Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const catItems = filteredItems.filter((i) => i.category === cat.key);

          return (
            <div key={cat.key} className="space-y-3 flex flex-col">
              <div className="p-3 rounded-xl border border-border bg-muted/40 flex items-center justify-between">
                <span className={cn("text-xs font-bold", cat.color)}>{cat.title}</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {catItems.length}
                </Badge>
              </div>

              <div className="space-y-2.5 flex-1">
                {catItems.map((item) => (
                  <Card
                    key={`${item.caseId}-${item.id}`}
                    className="border-border bg-card shadow-xs hover:border-primary/40 transition-all p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-primary font-bold">{item.caseId}</span>
                          <span className="text-[10px] text-muted-foreground">• {item.department}</span>
                        </div>
                        <strong className="text-xs font-bold text-foreground block mt-0.5">
                          {item.patientName}
                        </strong>
                      </div>
                      <Badge
                        variant={
                          item.status === "Done"
                            ? "success"
                            : item.status === "Missing"
                            ? "destructive"
                            : item.status === "Overdue"
                            ? "warning"
                            : item.status === "Waived - Emergency Override"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[9px]"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <div className="p-2 rounded bg-muted/30 border border-border/60 text-xs">
                      <p className="text-[11px] font-medium text-foreground">{item.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                        <span>Owner: {item.owner}</span>
                        <span className="font-mono">Due: {item.deadline}</span>
                      </div>
                    </div>

                    {/* Action Toggles */}
                    <div className="pt-1.5 border-t border-border/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <Button
                          variant={item.status === "Done" ? "default" : "outline"}
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => handleToggleStatus(item.caseId, item.id, "Done")}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Done
                        </Button>
                        <Button
                          variant={item.status === "Missing" ? "destructive" : "outline"}
                          size="sm"
                          className="h-6 text-[10px] px-2 text-rose-600"
                          onClick={() => handleToggleStatus(item.caseId, item.id, "Missing")}
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Missing
                        </Button>
                      </div>
                      <Link
                        href={`/hospital-admin/surgical-cases/${item.caseId}`}
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5"
                      >
                        Case <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </Card>
                ))}

                {catItems.length === 0 && (
                  <div className="p-6 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                    No items in this category.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
