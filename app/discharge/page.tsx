"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { formatINR, formatDate } from "@/lib/utils";

export default function DischargeBillingPage() {
  const { currentOrg, currentUser, encounters, patients, invoices, insuranceClaims, dispatch } = useApp();

  // Filter admissions for current hospital
  const admissions = useMemo(() => {
    return encounters.filter(
      (e) => (e.type === "ipd" || e.type === "surgery") && e.admissionId
    );
  }, [encounters]);

  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string>(
    admissions[0]?.admissionId || "ADM-4521"
  );
  const [settledSuccessMsg, setSettledSuccessMsg] = useState("");
  const [query, setQuery] = useState("");

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      const pat = patients.find((p) => p.id === adm.patientId);
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        pat?.name.toLowerCase().includes(q) ||
        pat?.uhid.toLowerCase().includes(q) ||
        adm.admissionId?.toLowerCase().includes(q)
      );
    });
  }, [admissions, patients, query]);

  const columns: Column<typeof admissions[0]>[] = [
    {
      header: "Patient",
      accessor: (adm) => {
        const pat = patients.find((p) => p.id === adm.patientId);
        return (
          <div>
            <div className="font-bold">{pat?.name}</div>
            <div className="text-[10px] text-ink-500">{pat?.uhid}</div>
          </div>
        );
      },
    },
    {
      header: "Admission ID",
      accessor: (adm) => (
        <span className="font-mono bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">{adm.admissionId}</span>
      ),
    },
    {
      header: "Department & Room",
      accessor: (adm) => (
        <div>
          <div>{adm.department}</div>
          <div className="text-[10px] text-ink-500">{adm.roomBed || "Ward"}</div>
        </div>
      ),
    },
    {
      header: "Doctor",
      accessor: (adm) => `Dr. ${adm.doctorName?.replace("Dr. ", "")}`,
    },
    {
      header: "Status",
      accessor: (adm) => <StatusBadge status={adm.status} />,
    },
  ];

  const selectedEncounter = admissions.find((a) => a.admissionId === selectedAdmissionId) || admissions[0];
  const selectedPatient = patients.find((p) => p.id === selectedEncounter?.patientId);

  // Invoices linked to this admission / patient
  const admissionInvoices = useMemo(() => {
    if (!selectedPatient) return [];
    return invoices.filter(
      (i) => i.patientId === selectedPatient.id && i.organizationId === currentOrg.id && i.status !== "cancelled"
    );
  }, [invoices, selectedPatient, currentOrg.id]);

  // Aggregate financial metrics across invoices
  const aggregateMetrics = useMemo(() => {
    let grossTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    let totalPaid = 0;
    let roomNursingTotal = 0;
    let surgeryOtTotal = 0;
    let diagnosticsTotal = 0;
    let pharmacyTotal = 0;

    admissionInvoices.forEach((inv) => {
      grossTotal += inv.subtotal;
      discountTotal += inv.discountTotal;
      taxTotal += inv.taxTotal;
      totalPaid += inv.paidTotal;

      inv.lineItems.forEach((li) => {
        if (li.source === "ipd") roomNursingTotal += li.total;
        else if (li.source === "surgery") surgeryOtTotal += li.total;
        else if (li.source === "diagnostics") diagnosticsTotal += li.total;
        else if (li.source === "pharmacy") pharmacyTotal += li.total;
        else roomNursingTotal += li.total;
      });
    });

    const netTotal = Math.max(0, grossTotal - discountTotal + taxTotal);
    const outstanding = Math.max(0, netTotal - totalPaid);

    return {
      grossTotal,
      discountTotal,
      taxTotal,
      netTotal,
      totalPaid,
      outstanding,
      roomNursingTotal,
      surgeryOtTotal,
      diagnosticsTotal,
      pharmacyTotal,
    };
  }, [admissionInvoices]);

  // Find insurance claim for this patient/invoices
  const claim = useMemo(() => {
    if (!selectedPatient) return null;
    return insuranceClaims.find((c) => c.patientId === selectedPatient.id);
  }, [insuranceClaims, selectedPatient]);

  function handleFinalSettlement() {
    if (!selectedPatient || admissionInvoices.length === 0) return;
    const targetInvoice = admissionInvoices[0];
    dispatch({
      type: "FINAL_DISCHARGE_SETTLEMENT",
      patientId: selectedPatient.id,
      invoiceId: targetInvoice.id,
      user: currentUser.name,
    });
    setSettledSuccessMsg(
      `Billing cleared and settled for ${selectedPatient.name} (Admission ${selectedEncounter.admissionId}). Clinical discharge process can now finalize.`
    );
  }

  if (currentOrg.type !== "hospital") {
    return (
      <div className="p-6 text-center">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900 shadow-sm">
          <p className="font-bold text-base mb-1">Hospital Module Only</p>
          <p className="text-xs text-amber-800">
            Discharge Billing is a hospital-specific workflow for IPD and Surgery admissions. Switch to Vardhman Hospital to view this module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discharge Billing & Settlement"
        description="Aggregates room, nursing, procedure, diagnostic, pharmacy, and OT charges for patient admissions. Handles final financial settlement prior to discharge."
      />

      {/* Explicit Read-Only Clinical Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <span className="text-base">ℹ️</span>
          <div>
            <strong className="font-bold">Read-Only Clinical Context:</strong> Billing Staff manages financial settlement only. Clinical discharge (discharge summary, medical clearing, prescriptions) is performed by medical staff in the HMS clinical module.
          </div>
        </div>
        <span className="self-start sm:self-center shrink-0 rounded bg-blue-100 px-2 py-0.5 font-bold text-[10px] text-blue-800 uppercase tracking-wider">Financial Settlement</span>
      </div>

      {settledSuccessMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>✅ {settledSuccessMsg}</span>
          <button onClick={() => setSettledSuccessMsg("")} className="text-emerald-600 hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {/* Admission Selection Table */}
      <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Select Active Hospital Admission
          </label>
          <div className="w-full sm:w-64">
            <SearchBar value={query} onChange={setQuery} placeholder="Search admissions..." ariaLabel="Search admissions" />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={filteredAdmissions}
          rowKey={(adm) => adm.admissionId || ""}
          emptyTitle="No admissions found"
          emptyDescription="Try adjusting your search query."
          onRowClick={(adm) => {
            setSelectedAdmissionId(adm.admissionId || "");
            setSettledSuccessMsg("");
          }}
          pagination={true}
          pageSize={5}
          selectedRowKey={selectedAdmissionId}
        />
      </div>

      {/* Selected Admission Discharge Summary Dashboard */}
      {selectedPatient && selectedEncounter && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient & Admission Meta */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm space-y-4">
              <div className="border-b border-ink-100 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Patient & Admission Context</p>
                <h3 className="text-lg font-bold text-ink-900 mt-0.5">{selectedPatient.name}</h3>
                <p className="text-xs font-mono text-ink-500">UHID: {selectedPatient.uhid}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-ink-50">
                  <span className="text-ink-500">Age / Gender:</span>
                  <span className="font-semibold text-ink-800">{selectedPatient.age} yrs / {selectedPatient.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink-50">
                  <span className="text-ink-500">Admission ID:</span>
                  <span className="font-mono font-semibold text-ink-800">{selectedEncounter.admissionId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink-50">
                  <span className="text-ink-500">Room / Bed:</span>
                  <span className="font-semibold text-ink-800">{selectedEncounter.roomBed || "General"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink-50">
                  <span className="text-ink-500">Department:</span>
                  <span className="font-semibold text-ink-800">{selectedEncounter.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink-50">
                  <span className="text-ink-500">Treating Doctor:</span>
                  <span className="font-semibold text-ink-800">{selectedEncounter.doctorName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink-50">
                  <span className="text-ink-500">Admission Date:</span>
                  <span className="font-semibold text-ink-800">{formatDate(selectedEncounter.date)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-500">Billing Status:</span>
                  <StatusBadge status={aggregateMetrics.outstanding === 0 ? "paid" : "partially_paid"} />
                </div>
              </div>

              {/* Insurance / TPA Card */}
              {claim && (
                <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900">Insurance / TPA Claim</span>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-purple-700">Policy: <span className="font-mono">{claim.policyNumber}</span></p>
                  <div className="flex justify-between pt-1 text-[11px]">
                    <span className="text-purple-700">Payer Outstanding:</span>
                    <span className="font-bold text-purple-900">{formatINR(claim.payerOutstanding)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-purple-700">Patient Responsibility:</span>
                    <span className="font-bold text-purple-900">{formatINR(claim.patientResponsibility)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Charge Aggregation & Settlement Actions */}
          <div className="space-y-4 lg:col-span-2">
            {/* Charge Category Breakdown */}
            <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Aggregated Inpatient Charges Breakdown
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3">
                  <p className="text-[10px] font-semibold text-ink-500 uppercase">Room & Nursing</p>
                  <p className="text-sm font-bold text-ink-900 mt-1">{formatINR(aggregateMetrics.roomNursingTotal)}</p>
                </div>
                <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3">
                  <p className="text-[10px] font-semibold text-ink-500 uppercase">Surgery & OT</p>
                  <p className="text-sm font-bold text-ink-900 mt-1">{formatINR(aggregateMetrics.surgeryOtTotal)}</p>
                </div>
                <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3">
                  <p className="text-[10px] font-semibold text-ink-500 uppercase">Diagnostics</p>
                  <p className="text-sm font-bold text-ink-900 mt-1">{formatINR(aggregateMetrics.diagnosticsTotal)}</p>
                </div>
                <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3">
                  <p className="text-[10px] font-semibold text-ink-500 uppercase">IP Pharmacy</p>
                  <p className="text-sm font-bold text-ink-900 mt-1">{formatINR(aggregateMetrics.pharmacyTotal)}</p>
                </div>
              </div>

              {/* Linked Invoices Table */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-ink-700">Linked Invoices for this Admission:</p>
                <div className="divide-y border rounded-lg overflow-hidden text-xs">
                  {admissionInvoices.map((inv) => (
                    <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 bg-white hover:bg-ink-50">
                      <div>
                        <span className="font-mono font-bold text-brand-700">{inv.invoiceNumber}</span>
                        <span className="ml-2 text-ink-400">({inv.scope.toUpperCase()} scope)</span>
                        <span className="block text-[11px] text-ink-500">{inv.lineItems.map((l) => l.serviceName).join(", ")}</span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 text-right">
                        <span className="font-bold text-ink-900">{formatINR(inv.total)}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Settlement Total Box */}
              <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-800">Gross Total Charges:</span>
                  <span className="font-bold text-brand-900">{formatINR(aggregateMetrics.grossTotal)}</span>
                </div>
                {aggregateMetrics.discountTotal > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-700">
                    <span>Approved Concessions/Discounts:</span>
                    <span className="font-bold">- {formatINR(aggregateMetrics.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-brand-800">
                  <span>Tax & Configured Charges:</span>
                  <span className="font-bold">+ {formatINR(aggregateMetrics.taxTotal)}</span>
                </div>
                <div className="border-t border-brand-200 pt-2 flex justify-between items-center text-sm font-bold text-brand-950">
                  <span>Net Total Settlement Amount:</span>
                  <span>{formatINR(aggregateMetrics.netTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-brand-800">
                  <span>Total Amount Paid to Date:</span>
                  <span className="font-bold text-emerald-700">{formatINR(aggregateMetrics.totalPaid)}</span>
                </div>
                <div className="border-t border-brand-200 pt-2 flex justify-between items-center text-base font-black text-ink-900">
                  <span>Remaining Balance Due:</span>
                  <span className={aggregateMetrics.outstanding > 0 ? "text-amber-600" : "text-emerald-600"}>
                    {formatINR(aggregateMetrics.outstanding)}
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-xs text-ink-500">
                  {aggregateMetrics.outstanding === 0 ? (
                    <span className="text-emerald-700 font-semibold">✅ Balance is 0. Ready for final settlement clearance.</span>
                  ) : (
                    <span className="text-amber-700 font-semibold">⚠️ Patient balance remaining before discharge clearance.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {selectedEncounter.status !== "discharged" ? (
                    <button
                      onClick={handleFinalSettlement}
                      className="w-full sm:w-auto rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                    >
                      Clear Billing & Mark Settled for Discharge
                    </button>
                  ) : (
                    <span className="w-full sm:w-auto rounded-lg bg-ink-100 px-3 py-2 text-xs font-semibold text-ink-600 text-center">
                      ✅ Discharge Billing Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
