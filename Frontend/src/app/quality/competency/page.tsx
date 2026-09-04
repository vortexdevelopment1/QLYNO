"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Badge";
import { MOCK_USERS } from "@/data/mock/integrations";
import { ROLE_CONFIG } from "@/config/roles";

const SKILLS = ["Specimen ID & Collection", "Chemistry Analyzer Ops", "Hematology Analyzer Ops", "Result Validation", "QC & Westgard Rules", "Critical Result Escalation"];

// deterministic mock competency levels
const LEVELS: Array<"not_assessed" | "trained" | "competent" | "expert"> = ["not_assessed", "trained", "competent", "expert"];
function levelFor(userIndex: number, skillIndex: number) {
  return LEVELS[(userIndex + skillIndex) % LEVELS.length];
}

const LEVEL_TONE = { not_assessed: "neutral", trained: "info", competent: "success", expert: "pending" } as const;
const LEVEL_LABEL = { not_assessed: "Not assessed", trained: "Trained", competent: "Competent", expert: "Expert / Assessor" };

export default function CompetencyPage() {
  const staff = MOCK_USERS.filter((u) => ["technologist", "section_supervisor", "phlebotomist", "accessioning"].includes(u.roleId));

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 8 · Quality Management" title="Staff Competency Matrix" subtitle="Training and competency assessment status across core laboratory skills." />
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-app-border bg-app-sidebar">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Staff member</th>
              {SKILLS.map((s) => (
                <th key={s} className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((u, ui) => (
              <tr key={u.id} className="border-b border-app-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-text-main">{u.name}</p>
                  <p className="text-xs text-text-muted">{ROLE_CONFIG[u.roleId].label}</p>
                </td>
                {SKILLS.map((s, si) => {
                  const level = levelFor(ui, si);
                  return (
                    <td key={s} className="px-3 py-3">
                      <Chip tone={LEVEL_TONE[level]}>{LEVEL_LABEL[level]}</Chip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
