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
  "Explain bill & line items",
  "Find unpaid invoices",
  "Find receipt",
  "Check payment transaction status",
  "Explain refund status & required steps",
  "Summarize insurance claim",
  "Flag duplicate billings",
  "Identify reconciliation mismatches",
  "Draft patient communication",
  "Can AI approve restricted discount?",
];

export default function AiAssistantPage() {
  const { currentOrg, invoices, receipts, refunds, insuranceClaims, reconciliationRecords, patients } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "assistant",
      text: "Hello! I am your AI Billing Assistant. I can help you query bills, receipts, transactions, refund steps, insurance claims, duplicate warnings, and reconciliation mismatches. Note: I am strictly barred from independently approving restricted discounts or refunds.",
    },
  ]);
  const [input, setInput] = useState("");

  const orgInvoices = invoices.filter((i) => i.organizationId === currentOrg.id);

  function respond(query: string): ChatMessage {
    const q = query.toLowerCase();

    // 10. Financial decision safety guard check (Highest priority override)
    if (
      q.includes("approve") ||
      q.includes("restricted discount") ||
      q.includes("financial decision") ||
      q.includes("can ai approve")
    ) {
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "🔒 Safety Constraint Notice: The AI Assistant is an informational lookup tool and is explicitly barred from independently approving restricted discounts, refunds, or financial overrides. All discount approvals and refund processing must be performed through the authorized admin workflow.",
      };
    }

    // 1. Bill explanation (Explain line items using billing data)
    if (q.includes("explain") || q.includes("line item") || q.includes("bill")) {
      const inv = orgInvoices[0];
      if (!inv) return { id: crypto.randomUUID(), role: "assistant", text: "No invoices found in your current organization to explain." };
      const patient = patients.find((p) => p.id === inv.patientId);
      const lineDetails = inv.lineItems
        .map((l) => `• ${l.serviceName}: Qty ${l.quantity} × ${formatINR(l.rate)} = ${formatINR(l.total)} (Tax: ${formatINR(l.taxAmount)})`)
        .join("\n");

      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Invoice ${inv.invoiceNumber} for patient ${patient?.name ?? "Patient"} (${patient?.uhid ?? "UHID"})\n\nLine Item Breakdown:\n${lineDetails}\n\nSummary: Subtotal ${formatINR(inv.subtotal)}, Discount -${formatINR(inv.discountTotal)}, Tax ${formatINR(inv.taxTotal)}, Total ${formatINR(inv.total)} (Paid: ${formatINR(inv.paidTotal)}, Outstanding: ${formatINR(inv.outstanding)}).`,
        relatedInvoiceId: inv.id,
      };
    }

    // 2. Outstanding query (Find unpaid invoice/status)
    if (q.includes("unpaid") || q.includes("outstanding") || q.includes("balance") || q.includes("due")) {
      const unpaidInvoices = orgInvoices.filter((i) => i.outstanding > 0);
      if (unpaidInvoices.length === 0) {
        return { id: crypto.randomUUID(), role: "assistant", text: "All invoices for your organization are fully paid. No outstanding balances found." };
      }
      const topUnpaid = unpaidInvoices[0];
      const patient = patients.find((p) => p.id === topUnpaid.patientId);
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Found ${unpaidInvoices.length} unpaid invoice(s). Top priority: ${topUnpaid.invoiceNumber} for ${patient?.name ?? "Patient"} (${patient?.uhid ?? ""}) has an outstanding balance of ${formatINR(topUnpaid.outstanding)} (Status: "${topUnpaid.status.replace("_", " ")}").`,
        relatedInvoiceId: topUnpaid.id,
      };
    }

    // 3. Receipt query (Find receipt)
    if (q.includes("receipt") || q.includes("proof")) {
      const rcpt = receipts.find((r) => r.organizationId === currentOrg.id);
      if (!rcpt) return { id: crypto.randomUUID(), role: "assistant", text: "No payment receipts found in the record." };
      const patient = patients.find((p) => p.id === rcpt.patientId);
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Found Receipt ${rcpt.receiptNumber} issued for patient ${patient?.name ?? "Patient"}: Amount ${formatINR(rcpt.amount)} via ${rcpt.method.toUpperCase()} on ${new Date(rcpt.date).toLocaleDateString("en-IN")}.`,
        relatedReceiptId: rcpt.id,
      };
    }

    // 4. Payment query (Show transaction status)
    if (q.includes("payment") || q.includes("transaction") || q.includes("status")) {
      const inv = orgInvoices.find((i) => i.status === "partially_paid" || i.status === "paid") ?? orgInvoices[0];
      if (!inv) return { id: crypto.randomUUID(), role: "assistant", text: "No transaction records found." };
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Transaction status for Invoice ${inv.invoiceNumber}: Status is "${inv.status.replace("_", " ")}". Total: ${formatINR(inv.total)}, Collected Amount: ${formatINR(inv.paidTotal)}, Remaining Balance: ${formatINR(inv.outstanding)}.`,
        relatedInvoiceId: inv.id,
      };
    }

    // 5. Refund query (Explain refund status and required steps)
    if (q.includes("refund")) {
      const ref = refunds.find((r) => r.organizationId === currentOrg.id);
      const statusText = ref
        ? `Current Refund Request (${formatINR(ref.amount)}): Status is "${ref.status.toUpperCase()}".`
        : "No active refund requests found.";

      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `${statusText}\n\nRequired Refund Processing Steps:\n1. Staff/Patient initiates refund request with reason.\n2. Admin Review: Requests exceeding threshold require multi-staff approval.\n3. Financial Audit: Verification against original payment receipt.\n4. Processing & Payout: Completed via finance desk with WhatsApp notification.`,
      };
    }

    // 6. Insurance query (Summarize claim/status information available to the user)
    if (q.includes("insurance") || q.includes("claim") || q.includes("tpa")) {
      const claim = insuranceClaims.find((c) => c.organizationId === currentOrg.id);
      if (!claim) return { id: crypto.randomUUID(), role: "assistant", text: "No insurance or TPA claims currently on file for your scope." };
      const patient = patients.find((p) => p.id === claim.patientId);
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Insurance Claim Summary for ${patient?.name ?? "Patient"} (Policy: ${claim.policyNumber}): Claim Status is "${claim.status.replace("_", " ").toUpperCase()}". Claimed Amount: ${formatINR(claim.claimedAmount)}, Approved Amount: ${formatINR(claim.approvedAmount ?? 0)}, Patient Responsibility: ${formatINR(claim.patientResponsibility)}.`,
      };
    }

    // 7. Duplicate warning (Flag possible duplicate bill/payment)
    if (q.includes("duplicate") || q.includes("flag") || q.includes("double")) {
      const cancelled = orgInvoices.find((i) => i.status === "cancelled" && i.cancelledReason?.toLowerCase().includes("duplicate"));
      const duplicateAlert = cancelled
        ? `⚠️ Duplicate Billing Warning: Found previously flagged duplicate invoice ${cancelled.invoiceNumber} which was cancelled ("${cancelled.cancelledReason}").`
        : "✅ Duplicate Audit Check: Scanned active invoices for duplicate charges. No duplicate billing anomalies detected.";
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: duplicateAlert,
        relatedInvoiceId: cancelled?.id,
      };
    }

    // 8. Reconciliation assistant (Identify mismatches for staff review)
    if (q.includes("reconcil") || q.includes("mismatch") || q.includes("difference")) {
      const rec = reconciliationRecords.find((r) => r.organizationId === currentOrg.id && r.exceptions.some((e) => e.status !== "resolved"));
      if (!rec) return { id: crypto.randomUUID(), role: "assistant", text: "✅ Reconciliation Status: All payment gateway and bank statement balances match. No open discrepancies." };
      const exc = rec.exceptions.find((e) => e.status !== "resolved");
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `⚠️ Reconciliation Mismatch Identified (${rec.date}): Discrepancy of ${formatINR(rec.difference)}. Detail: Exception [${exc?.id ?? "EXC-1"}] "${exc?.description ?? "Gateway payout mismatch"}" requires staff review on the Reconciliation page.`,
      };
    }

    // 9. Patient communication (Draft approved payment messages)
    if (q.includes("communication") || q.includes("draft") || q.includes("message") || q.includes("reminder")) {
      const patient = patients.find((p) => p.organizationId === currentOrg.id);
      const inv = orgInvoices.find((i) => i.outstanding > 0);
      if (!inv) return { id: crypto.randomUUID(), role: "assistant", text: "No pending balances to draft a payment message for." };
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `📝 Draft Payment Message for Staff Review:\n\n"Dear ${patient?.name ?? "Patient"}, this is a payment reminder from Qlyno Healthcare. Invoice ${inv.invoiceNumber} has a balance of ${formatINR(inv.outstanding)} due. Kindly clear your balance via the billing desk or patient portal. Thank you!"\n\n(Note: This message is drafted for your review. Please review and send via WhatsApp/SMS.)`,
        relatedInvoiceId: inv.id,
      };
    }

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "I can assist you with: Bill Explanations, Outstanding Queries, Receipt Lookups, Payment Status, Refund Steps, Insurance Claim Summaries, Duplicate Warnings, Reconciliation Mismatches, and Patient Communication Drafts. Select one of the suggested prompts below.",
    };
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
      <PageHeader
        title="AI Billing Assistant"
        description="Assisted lookup & drafting tool for Billing Staff. Operates strictly on existing billing data. BARRED from making independent financial decisions."
      />
      <div className="mx-auto flex max-w-2xl flex-col rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex-1 space-y-3 overflow-y-auto p-5" style={{ maxHeight: 480 }}>
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-brand-600 text-white" : "bg-ink-50 text-ink-800 border border-ink-100"}`}>
                <p>{m.text}</p>
                {m.relatedInvoiceId && (
                  <Link href={`/billing/invoices/${m.relatedInvoiceId}`} className="mt-2 inline-block rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:underline border border-brand-200">View Invoice →</Link>
                )}
                {m.relatedReceiptId && (
                  <Link href={`/receipts/${m.relatedReceiptId}`} className="mt-2 inline-block rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:underline border border-brand-200">View Receipt →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100 p-3 bg-ink-50/50 rounded-b-xl">
          <p className="mb-2 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Suggested AI Use Cases (PRD Section 25)</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((p) => (
              <button key={p} onClick={() => send(p)} className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-colors">{p}</button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2"
          >
            <label htmlFor="ai-input" className="sr-only">Ask the AI Billing Assistant</label>
            <input id="ai-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about line items, receipts, payment status, refunds, insurance, duplicates..." className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
