"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { Card, MetricCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Wallet, IndianRupee, CreditCard, Smartphone } from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils/format";

export default function CashierPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Cashier" subtitle="Active shift summary and day-end reconciliation." />
      <BillingGuard>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Cash collected" value={formatCurrencyINR(42500)} icon={IndianRupee} tone={0} />
          <MetricCard label="Card payments" value={formatCurrencyINR(68200)} icon={CreditCard} tone={1} />
          <MetricCard label="UPI payments" value={formatCurrencyINR(51300)} icon={Smartphone} tone={2} />
          <MetricCard label="Shift total" value={formatCurrencyINR(162000)} icon={Wallet} tone={3} />
        </div>
        <Card className="p-5">
          <h3 className="mb-2 text-sm font-semibold text-text-main">Day-end reconciliation</h3>
          <p className="mb-4 text-xs text-text-muted">Shift opened at 08:00 by Farah Sheikh · Andheri Branch</p>
          <Button size="sm" onClick={() => showToast({ title: "Shift reconciled (simulated)", description: "Day-end totals locked.", tone: "success" })}>
            Reconcile & close shift
          </Button>
        </Card>
      </BillingGuard>
    </div>
  );
}
