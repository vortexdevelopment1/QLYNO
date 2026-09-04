"use client";

import Link from "next/link";
import { Receipt, FileText, CreditCard, Undo2, Wallet, FileSignature, TrendingUp, GitMerge } from "lucide-react";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card, MetricCard } from "@/components/ui/Card";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { useDemo } from "@/state/demo-context";
import { MOCK_INVOICES } from "@/data/mock/billing";
import { formatCurrencyINR } from "@/lib/utils/format";

export default function BillingPage() {
  const { tenantMode } = useDemo();
  const outstanding = MOCK_INVOICES.filter((i) => i.status === "invoiced" || i.status === "partially_paid").reduce((sum, i) => sum + i.amount, 0);
  const paidToday = MOCK_INVOICES.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);

  const sections = [
    { href: "/billing/estimates", label: "Estimates", icon: FileText, desc: "Pre-order cost estimates" },
    { href: "/billing/invoices", label: "Invoices", icon: Receipt, desc: "Patient invoices & B2B statements" },
    { href: "/billing/payments", label: "Payments", icon: CreditCard, desc: "Cash, card, UPI & bank transfer records" },
    { href: "/billing/refunds", label: "Refunds", icon: Undo2, desc: "Refunds and credit notes" },
    ...(tenantMode !== "b2b" ? [{ href: "/billing/cashier", label: "Cashier", icon: Wallet, desc: "Cashier shift sessions & day-end reconciliation" }] : []),
    { href: "/billing/contracts", label: "Contracts", icon: FileSignature, desc: "B2B rate cards, credit limits & terms" },
    { href: "/billing/receivables", label: "Receivables", icon: TrendingUp, desc: "Ageing receivables across clients" },
    { href: "/billing/reconciliation", label: "Reconciliation", icon: GitMerge, desc: "Day-end and settlement reconciliation" },
  ];

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Commercial & Billing" subtitle="LIS-internal and B2B billing — hospital-billed orders never appear here." />
      <BillingGuard>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Outstanding receivables" value={formatCurrencyINR(outstanding)} icon={TrendingUp} tone={1} href="/billing/receivables" />
          <MetricCard label="Paid (recent)" value={formatCurrencyINR(paidToday)} icon={Receipt} tone={0} href="/billing/invoices" />
          <MetricCard label="Pending estimates" value={MOCK_INVOICES.filter((i) => i.status === "estimate").length} icon={FileText} tone={2} href="/billing/estimates" />
          <MetricCard label="Credit notes issued" value={MOCK_INVOICES.filter((i) => i.status === "credit").length} icon={Undo2} tone={3} href="/billing/refunds" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-card">
              <Card className="flex items-start gap-3 p-4 transition-shadow hover:shadow-md">
                <s.icon className="mt-0.5 h-5 w-5 text-brand-blue" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-text-main">{s.label}</p>
                  <p className="text-xs text-text-muted">{s.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </BillingGuard>
    </div>
  );
}
