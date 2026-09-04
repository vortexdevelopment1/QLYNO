"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Result } from "@/lib/types/domain";
import { ResultFlag } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils/format";

export function ReportPreview({
  patientName,
  orderId,
  results,
  releasedAt,
  authorizedBy,
  status,
}: {
  patientName: string;
  orderId: string;
  results: Result[];
  releasedAt: string;
  authorizedBy: string;
  status: string;
}) {
  const { showToast } = useToast();

  return (
    <div className="rounded-card border border-app-border bg-app-surface p-5 print:border-0 print:shadow-none">
      <div className="flex items-center justify-between border-b border-app-border pb-3">
        <div>
          <p className="text-sm font-semibold text-text-main">Laboratory Report</p>
          <p className="text-xs text-text-muted">
            {orderId} · {patientName}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Print
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => showToast({ title: "Download simulated", description: "PDF export is not wired to real storage in this prototype.", tone: "info" })}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
          </Button>
        </div>
      </div>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-text-muted">
            <th className="py-2">Test</th>
            <th className="py-2">Result</th>
            <th className="py-2">Units</th>
            <th className="py-2">Reference range</th>
            <th className="py-2">Flag</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id} className="border-t border-app-border">
              <td className="py-2 font-medium">{r.testName}</td>
              <td className="py-2">{r.value}</td>
              <td className="py-2 text-text-muted">{r.units}</td>
              <td className="py-2 text-text-muted">{r.referenceRange}</td>
              <td className="py-2">
                <ResultFlag flag={r.flag} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between border-t border-app-border pt-3 text-xs text-text-muted">
        <span>
          Status: <span className="font-medium text-text-main">{status}</span>
        </span>
        <span>
          Authorized by {authorizedBy} · {formatDateTime(releasedAt)}
        </span>
      </div>
    </div>
  );
}
