"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatINR } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  relatedInvoiceId?: string;
  relatedReceiptId?: string;
}

const SUGGESTED_PROMPTS = [
  "Explain this bill",
  "Find unpaid invoice",
  "Find receipt",
  "Check payment status",
  "Check refund status",
  "Explain insurance claim",
  "Find duplicate billing",
  "Find reconciliation mismatch",
  "Draft payment reminder",
];

export default function AiAssistantPage() {
  const { currentOrg, invoices, receipts, refunds, insuranceClaims, reconciliationRecords, patients } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m0", role: "assistant", text: "Hi! I can help you look up bills, receipts, payment status, refunds, insurance claims and reconciliation mismatches. I can't approve discounts or refunds — those always require an authorized admin." },
  ]);
  const [input, setInput] = useState("");

  const orgInvoices = invoices.filter((i) => i.organizationId === currentOrg.id);

  function respond(query: string): ChatMessage {
    const q = query.toLowerCase();
    if (q.includes("explain") && q.includes("bill")) {
      const inv = orgInvoices[0];
      return { id: crypto.randomUUID(), role: "assistant", text: inv ? `Invoice ${inv.invoiceNumber} has ${inv.lineItems.length} line item(s) totaling ${formatINR(inv.total)}, of which ${formatINR(inv.paidTotal)} is paid and ${formatINR(inv.outstanding)} is outstanding.` : "I couldn't find an invoice to explain.", relatedInvoiceId: inv?.id };
    }
    if (q.includes("unpaid") || (q.includes("find") && q.includes("invoice"))) {
      const unpaid = orgInvoices.find((i) => i.outstanding > 0);
      return { id: crypto.randomUUID(), role: "assistant", text: unpaid ? `${unpaid.invoiceNumber} has an outstanding balance of ${formatINR(unpaid.outstanding)}.` : "No unpaid invoices found.", relatedInvoiceId: unpaid?.id };
    }
    if (q.includes("receipt")) {
      const rcpt = receipts.find((r) => r.organizationId === currentOrg.id);
      return { id: crypto.randomUUID(), role: "assistant", text: rcpt ? `Receipt ${rcpt.receiptNumber} for ${formatINR(rcpt.amount)} was issued via ${rcpt.method.toUpperCase()}.` : "No receipts found.", relatedReceiptId: rcpt?.id };
    }
    if (q.includes("payment status")) {
      const inv = orgInvoices.find((i) => i.status === "partially_paid") ?? orgInvoices[0];
      return { id: crypto.randomUUID(), role: "assistant", text: inv ? `${inv.invoiceNumber} is currently "${inv.status.replace("_", " ")}" — paid ${formatINR(inv.paidTotal)} of ${formatINR(inv.total)}.` : "No invoices found.", relatedInvoiceId: inv?.id };
    }
    if (q.includes("refund")) {
      const ref = refunds.find((r) => r.organizationId === currentOrg.id);
      return { id: crypto.randomUUID(), role: "assistant", text: ref ? `Refund of ${formatINR(ref.amount)} is currently "${ref.status}"${ref.requiresApproval ? " and requires approval" : ""}.` : "No refund requests found." };
    }
    if (q.includes("insurance")) {
      const claim = insuranceClaims.find((c) => c.organizationId === currentOrg.id);
      return { id: crypto.randomUUID(), role: "assistant", text: claim ? `Claim ${claim.policyNumber} is "${claim.status.replace("_", " ")}" — claimed ${formatINR(claim.claimedAmount)}, patient responsibility ${formatINR(claim.patientResponsibility)}.` : "No insurance claims on file." };
    }
    if (q.includes("duplicate")) {
      const cancelled = orgInvoices.find((i) => i.status === "cancelled" && i.cancelledReason?.toLowerCase().includes("duplicate"));
      return { id: crypto.randomUUID(), role: "assistant", text: cancelled ? `Found a duplicate: ${cancelled.invoiceNumber} was cancelled — "${cancelled.cancelledReason}"` : "No duplicate billing detected.", relatedInvoiceId: cancelled?.id };
    }
    if (q.includes("reconcil")) {
      const rec = reconciliationRecords.find((r) => r.organizationId === currentOrg.id && r.exceptions.some((e) => e.status !== "resolved"));
      return { id: crypto.randomUUID(), role: "assistant", text: rec ? `${rec.date} has an unresolved reconciliation difference of ${formatINR(rec.difference)}. Review it on the Reconciliation page.` : "No open reconciliation mismatches." };
    }
    if (q.includes("draft") && q.includes("reminder")) {
      const patient = patients.find((p) => p.organizationId === currentOrg.id);
      const inv = orgInvoices.find((i) => i.outstanding > 0);
      return { id: crypto.randomUUID(), role: "assistant", text: inv ? `Draft: "Hi ${patient?.name?.split(" ")[0] ?? "there"}, this is a reminder that ${formatINR(inv.outstanding)} is outstanding on invoice ${inv.invoiceNumber}. Please clear at your earliest convenience." This message requires your review before sending.` : "No outstanding invoices to draft a reminder for." };
    }
    if (q.includes("approve") || q.includes("discount") || q.includes("high") || q.includes("decision")) {
      return { id: crypto.randomUUID(), role: "assistant", text: "I can surface the relevant invoice or refund, but I can't independently approve restricted discounts or refunds — that decision always requires an authorized admin." };
    }
    return { id: crypto.randomUUID(), role: "assistant", text: "I can help with bill explanations, unpaid invoices, receipts, payment status, refund status, insurance claims, duplicate billing and reconciliation mismatches. Try one of the suggested prompts below." };
  }

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text };
    const aiMsg = respond(text);
    setMessages((m) => [...m, userMsg, aiMsg]);
    setInput("");
  }

  return (
    <div>
      <PageHeader title="AI Billing Assistant" description="Frontend simulation — no real AI API is used. The assistant never independently approves restricted discounts or refunds." />
      <div className="mx-auto flex max-w-2xl flex-col rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex-1 space-y-3 overflow-y-auto p-5" style={{ maxHeight: 480 }}>
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-brand-600 text-white" : "bg-ink-50 text-ink-800"}`}>
                <p>{m.text}</p>
                {m.relatedInvoiceId && (
                  <Link href={`/billing/invoices/${m.relatedInvoiceId}`} className="mt-2 inline-block rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-brand-700 hover:underline">View Invoice →</Link>
                )}
                {m.relatedReceiptId && (
                  <Link href={`/receipts/${m.relatedReceiptId}`} className="mt-2 inline-block rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-brand-700 hover:underline">View Receipt →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100 p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((p) => (
              <button key={p} onClick={() => send(p)} className="rounded-full border border-ink-200 px-2.5 py-1 text-[11px] text-ink-600 hover:border-brand-300 hover:text-brand-700">{p}</button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2"
          >
            <label htmlFor="ai-input" className="sr-only">Ask the AI Billing Assistant</label>
            <input id="ai-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a bill, refund, receipt…" className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
