"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import { Modal } from "@/components/ui/Overlay";

export function BarcodeLabelPreview({
  specimenId,
  patientName,
  testSummary,
  container,
}: {
  specimenId: string;
  patientName: string;
  testSummary: string;
  container: string;
}) {
  const { showToast } = useToast();
  const [reprintOpen, setReprintOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div className="rounded-card border border-app-border bg-app-surface p-4">
      <div className="mx-auto max-w-[280px] rounded-lg border border-dashed border-app-border bg-white p-3 font-mono text-[11px] leading-tight text-text-main">
        <div className="flex h-9 items-center justify-center gap-[2px]" aria-hidden="true">
          {Array.from({ length: 32 }).map((_, i) => (
            <span key={i} style={{ width: 2, height: (i % 5) + 4 * 4, background: "#172033" }} />
          ))}
        </div>
        <p className="mt-1 text-center tracking-widest">{specimenId}</p>
        <p className="mt-1 truncate">{patientName}</p>
        <p className="truncate text-text-muted">{testSummary}</p>
        <p className="truncate text-text-muted">{container}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            showToast({ title: "Label sent to printer (simulated)", description: specimenId, tone: "success" });
          }}
        >
          <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Print label
        </Button>
        <Button size="sm" variant="outline" onClick={() => setReprintOpen(true)}>
          Reprint label
        </Button>
      </div>
      <Modal
        open={reprintOpen}
        onClose={() => setReprintOpen(false)}
        title="Reprint label"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setReprintOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!reason.trim()}
              disabledReason="A reason is required to reprint a label"
              onClick={() => {
                showToast({ title: "Label reprinted (simulated)", description: `Reason: ${reason}`, tone: "warning" });
                setReprintOpen(false);
                setReason("");
              }}
            >
              Confirm reprint
            </Button>
          </>
        }
      >
        <label htmlFor="reprint-reason" className="mb-1 block text-xs font-medium text-text-muted">
          Reason for reprint
        </label>
        <textarea
          id="reprint-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-control border border-app-border bg-white p-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          placeholder="e.g. Original label smudged during transport"
        />
      </Modal>
    </div>
  );
}
