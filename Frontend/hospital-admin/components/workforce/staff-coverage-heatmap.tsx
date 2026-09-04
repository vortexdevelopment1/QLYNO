"use client";

import React, { useState } from "react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Button } from "@/hospital-admin/components/ui/button";
import { Users, AlertTriangle, CheckCircle2, Flame, ShieldAlert, Sparkles } from "lucide-react";
import { mockStaffCoverageHeatmap } from "@/hospital-admin/lib/mock-data/proposed-features";
import { StaffCoverageCell } from "@/hospital-admin/lib/types/proposed-features";
import { cn } from "@/hospital-admin/lib/utils";

const SHIFTS = [
  "Morning (07:00-15:00)",
  "Evening (15:00-23:00)",
  "Night (23:00-07:00)",
] as const;

export function StaffCoverageHeatmap() {
  const [selectedCell, setSelectedCell] = useState<StaffCoverageCell | null>(null);

  // Group by department
  const departments = Array.from(
    new Set(mockStaffCoverageHeatmap.map((c) => c.department))
  );

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" /> Staff Coverage Heatmap (24h Shift Matrix)
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                PROPOSED FEATURE (PRD 22)
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Visualize real-time clinical staffing adequacy, shift allocation gaps, and critical skill coverage across wards.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-muted-foreground">Optimal (100%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 inline-block" />
              <span className="text-muted-foreground">Minor Gap (-1)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-500 inline-block" />
              <span className="text-muted-foreground">Critical (-2+)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* 2D Heatmap Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground p-2 border-b border-border">
                  Clinical Department / Ward
                </th>
                {SHIFTS.map((shift) => (
                  <th
                    key={shift}
                    className="text-center text-xs font-semibold text-muted-foreground p-2 border-b border-border"
                  >
                    {shift}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-2.5 text-xs font-medium text-foreground">{dept}</td>
                  {SHIFTS.map((shift) => {
                    const cell = mockStaffCoverageHeatmap.find(
                      (c) => c.department === dept && c.shift === shift
                    );
                    if (!cell) {
                      return (
                        <td key={shift} className="p-2 text-center text-muted-foreground text-xs">
                          -
                        </td>
                      );
                    }

                    const isOptimal = cell.status === "Optimal";
                    const isMinor = cell.status === "Minor Deficit";
                    const isCritical = cell.status === "Critical Shortage";

                    return (
                      <td key={shift} className="p-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCell(cell)}
                          className={cn(
                            "w-full p-2.5 rounded-lg border text-left transition-all hover:scale-[1.02] cursor-pointer",
                            isOptimal &&
                              "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-500/20",
                            isMinor &&
                              "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300 hover:bg-amber-500/20",
                            isCritical &&
                              "bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-300 hover:bg-rose-500/25 animate-pulse"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono">
                              {cell.assignedStaff}/{cell.requiredStaff} Staff
                            </span>
                            {isOptimal && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                            {isMinor && <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                            {isCritical && <Flame className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
                          </div>
                          <div className="text-[10px] mt-1 opacity-80 flex items-center justify-between">
                            <span>{cell.status}</span>
                            {!cell.criticalSkillCovered && (
                              <span className="font-semibold text-rose-600 flex items-center gap-0.5">
                                <ShieldAlert className="h-2.5 w-2.5" /> Skill Gap
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Cell Drilldown Card */}
        {selectedCell && (
          <div className="p-3 bg-muted/30 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {selectedCell.department} — {selectedCell.shift}
              </span>
              <p className="text-muted-foreground text-[11px]">
                Assigned: {selectedCell.assignedStaff} • Required: {selectedCell.requiredStaff} • Deficit: {selectedCell.deficit} staff.
                {selectedCell.criticalSkillCovered
                  ? " Critical care & resuscitation certified staff present."
                  : " ⚠️ Certified scrub nurse or resuscitation skill coverage deficient!"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedCell(null)}>
                Dismiss
              </Button>
              {selectedCell.deficit > 0 && (
                <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground">
                  Summon On-Call Pool
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
