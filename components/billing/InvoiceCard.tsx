import Link from "next/link";
import { Invoice } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatINR, formatDate } from "@/lib/utils";

export function InvoiceCard({ invoice, patientName }: { invoice: Invoice; patientName?: string }) {
  return (
    <Link href={`/billing/invoices/${invoice.id}`} className="block rounded-xl border border-ink-100 bg-white p-4 shadow-card hover:border-brand-300">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-800">{invoice.invoiceNumber}</p>
        <StatusBadge status={invoice.status} />
      </div>
      {patientName && <p className="mt-0.5 text-xs text-ink-500">{patientName}</p>}
      <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
        <span>{formatDate(invoice.date)}</span>
        <span className="font-medium text-ink-800">{formatINR(invoice.total)}</span>
      </div>
    </Link>
  );
}
