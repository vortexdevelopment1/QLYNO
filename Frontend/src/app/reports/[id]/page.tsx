"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { ReportPreview } from "@/components/domain/ReportPreview";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { MOCK_REPORT_VERSIONS, MOCK_RESULTS } from "@/data/mock/results";
import { MOCK_ORDER_ITEMS, MOCK_ORDERS } from "@/data/mock/orders";
import { formatDateTime } from "@/lib/utils/format";

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const versions = MOCK_REPORT_VERSIONS.filter((r) => r.id.split("-v")[0] === id || r.orderId === id).sort((a, b) => a.version - b.version);
  if (versions.length === 0) notFound();

  const { showToast } = useToast();
  const [amendOpen, setAmendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const latest = versions[versions.length - 1];
  const orderId = latest.orderId;
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  const items = MOCK_ORDER_ITEMS.filter((i) => i.orderId === orderId);
  const results = MOCK_RESULTS.filter((r) => items.some((i) => i.id === r.orderItemId));

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 7 · Results & Reports"
        title={`Report — ${latest.id.split("-v")[0]}`}
        subtitle={latest.patientName}
        badges={<StatusBadge status={latest.status} />}
        actions={
          <><Button size="sm" variant="outline" onClick={() => window.print()}>Print / download</Button><Button size="sm" variant="destructive" onClick={() => setAmendOpen(true)}>Correct / amend report</Button></>
        }
      />

      {latest.status === "preliminary" && <Card className="border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-status-warning">Preliminary report — some ordered tests are still pending</p><p className="mt-1 text-xs text-text-muted">This is not the completed final report. Pending test groups will appear in a later immutable version or separate report group.</p></Card>}

      <ReportPreview patientName={latest.patientName} orderId={orderId} results={results} releasedAt={latest.releasedAt} authorizedBy={latest.authorizedBy} status={latest.status} />

      {versions.length > 1 && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Version history comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-text-muted">
                  <th className="py-2">Version</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2">Authorized by</th>
                  <th className="py-2">Released</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id} className="border-t border-app-border">
                    <td className="py-2 font-medium">v{v.version}</td>
                    <td className="py-2"><StatusBadge status={v.status} /></td>
                    <td className="py-2 text-text-muted">{v.reason ?? "—"}</td>
                    <td className="py-2">{v.authorizedBy}</td>
                    <td className="py-2">{formatDateTime(v.releasedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={amendOpen}
        onClose={() => setAmendOpen(false)}
        title="Correct / amend report"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAmendOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={!reason.trim()}
              disabledReason="A reason is required to create a new report version"
              onClick={() => {
                showToast({ title: "New report version created (simulated)", description: "Recipients will be re-notified.", tone: "warning" });
                setAmendOpen(false);
                setReason("");
              }}
            >
              Create new version
            </Button>
          </>
        }
      >
        <p className="mb-3 text-text-muted">Released reports are immutable. This creates a new version with your reason, the previous/new values, authorizer and timestamp — recipients will be re-notified.</p>
        <label htmlFor="amend-reason" className="mb-1 block text-xs font-medium text-text-muted">Reason for correction</label>
        <textarea
          id="amend-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-control border border-app-border bg-white p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          placeholder="e.g. Instrument re-run confirmed transcription error"
        />
      </Modal>
    </div>
  );
}
