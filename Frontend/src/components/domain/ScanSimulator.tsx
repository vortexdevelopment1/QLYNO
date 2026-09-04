"use client";

import { useState } from "react";
import { ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const SAMPLE_CODES = ["SPX-9001", "SPX-9004", "ACC-20260823-002", "MAN-3301"];

export function ScanSimulator({ onScan }: { onScan?: (code: string) => void }) {
  const [value, setValue] = useState("");
  const { showToast } = useToast();

  function handleScan(code: string) {
    if (!code.trim()) return;
    onScan?.(code.trim());
    showToast({ title: "Barcode scanned (simulated)", description: `Code: ${code.trim()}`, tone: "success" });
    setValue("");
  }

  return (
    <div className="rounded-card border border-app-border bg-app-surface p-5">
      <div className="flex items-center gap-2">
        <ScanBarcode className="h-5 w-5 text-brand-blue" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-text-main">Barcode scan simulator</h3>
      </div>
      <p className="mt-1 text-xs text-text-muted">
        No physical scanner is connected in this prototype. Type or pick a sample code to simulate a scan event.
      </p>
      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleScan(value);
        }}
      >
        <label htmlFor="scan-input" className="sr-only">
          Barcode value
        </label>
        <input
          id="scan-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Scan or type a code…"
          className="h-10 flex-1 rounded-control border border-app-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        />
        <Button type="submit" size="md">
          Simulate scan
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {SAMPLE_CODES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => handleScan(code)}
            className="rounded-full border border-app-border bg-app-bg px-3 py-1 text-xs text-text-muted hover:bg-white hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}
