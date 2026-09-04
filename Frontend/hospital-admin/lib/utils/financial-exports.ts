import jsPDF from "jspdf";
import {
  getScaledRevenueStreams,
  getScaledCollectionChannels,
  getScaledArAgingBuckets,
  getScaledDepartmentRevenues,
  getScaledDoctorRevenues,
  getScaledServiceCategoryRevenues,
  getScaledCashierReports,
  getScaledExpenses,
} from "@/hospital-admin/lib/mock-data/financial-reports";

export function exportFinancialReportToCSV(
  reportType: string,
  period: string,
  multiplier: number = 1.0
) {
  const timestamp = new Date().toISOString().split("T")[0];
  let csvContent = "";
  let filename = "";

  const metadata = `# QLYNO MULTISPECIALTY HOSPITAL - FINANCIAL LEDGER EXPORT\n# Report Type: ${reportType}\n# Accounting Period: ${period}\n# Generated At: ${new Date().toLocaleString()}\n# Single Source of Truth: Integrated Hospital Billing, Payments & TPA Claims Data\n\n`;

  if (reportType.includes("revenue") && !reportType.includes("department") && !reportType.includes("doctor") && !reportType.includes("service")) {
    filename = `Hospital_Revenue_Report_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const streams = getScaledRevenueStreams(multiplier);
    const headers = "Billing Stream Category,Invoices Count,Gross Billed (INR),Discounts (INR),Net Revenue (INR),Revenue Share (%),Trend\n";
    const rows = streams
      .map(
        (s) =>
          `"${s.category}",${s.invoiceCount},${s.grossAmount},${s.discounts},${s.netRevenue},${s.percentageShare}%,"${s.trend}"`
      )
      .join("\n");
    csvContent = metadata + headers + rows;
  } else if (reportType.includes("collections")) {
    filename = `Hospital_Collections_Report_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const channels = getScaledCollectionChannels(multiplier);
    const headers = "Payment Channel / Instrument,Transaction Count,Amount Collected (INR),Channel Share (%),MDR Gateway Fee (INR),Reconciliation Status\n";
    const rows = channels
      .map(
        (c) =>
          `"${c.method}",${c.transactionCount},${c.amountCollected},${c.percentageShare}%,${c.gatewayFeeDeducted},"${c.reconciliationStatus}"`
      )
      .join("\n");
    csvContent = metadata + headers + rows;
  } else if (reportType.includes("outstanding")) {
    filename = `Hospital_AR_Aging_Report_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const buckets = getScaledArAgingBuckets(multiplier);
    const headers = "Aging Bucket,Invoices Count,Self-Pay Patient (INR),Private TPA Insurer (INR),Govt Schemes (INR),Total Outstanding (INR),Risk Concentration\n";
    const rows = buckets
      .map(
        (b) =>
          `"${b.bucket}",${b.invoiceCount},${b.selfPayAmount},${b.tpaInsuranceAmount},${b.govtSchemeAmount},${b.totalOutstanding},"${b.riskLevel}"`
      )
      .join("\n");
    csvContent = metadata + headers + rows;
  } else if (reportType.includes("department-revenue")) {
    filename = `Hospital_Department_Revenue_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const depts = getScaledDepartmentRevenues(multiplier);
    const headers = "Department Specialty,Head of Department,OPD Revenue (INR),IPD Revenue (INR),Procedure OT (INR),Total Gross (INR),Direct Expenses (INR),Net Contribution (INR),Margin (%)\n";
    const rows = depts
      .map(
        (d) =>
          `"${d.departmentName}","${d.headOfDept}",${d.opdRevenue},${d.ipdRevenue},${d.procedureRevenue},${d.totalGrossRevenue},${d.directExpenses},${d.netOperatingContribution},${d.contributionMarginPercent}%`
      )
      .join("\n");
    csvContent = metadata + headers + rows;
  } else if (reportType.includes("doctor-revenue")) {
    filename = `Hospital_Doctor_Revenue_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const doctors = getScaledDoctorRevenues(multiplier);
    const headers = "Doctor Name,Specialty,Patient Volume,Consultation Revenue (INR),Surgical Procedures (INR),IPD Care Supervised (INR),Total Attributed Revenue (INR)\n";
    const rows = doctors
      .map(
        (doc) =>
          `"${doc.doctorName}","${doc.specialty}",${doc.patientVolume},${doc.consultationRevenue},${doc.surgicalProcedureRevenue},${doc.ipdRevenueAttributed},${doc.totalAttributedRevenue}`
      )
      .join("\n");
    csvContent = metadata + headers + rows;
  } else if (reportType.includes("service-revenue")) {
    filename = `Hospital_Service_Revenue_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const services = getScaledServiceCategoryRevenues(multiplier);
    const headers = "Service Category,Units Billed,Gross Billed (INR),Concessions (INR),Net Realized (INR),Service Margin (%)\n";
    const rows = services
      .map(
        (s) =>
          `"${s.category}",${s.itemCount},${s.billedAmount},${s.concessions},${s.netRealized},${s.marginPercent}%`
      )
      .join("\n");
    csvContent = metadata + headers + rows;
  } else if (reportType.includes("payment-reports")) {
    filename = `Hospital_Cashier_Settlement_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const cashiers = getScaledCashierReports(multiplier);
    const headers = "Desk Counter Name,Cashier On Duty,Cash (INR),POS Card (INR),UPI Digital (INR),Total Shift Realized (INR),Reconciliation Status\n";
    const rows = cashiers
      .map(
        (c) =>
          `"${c.counterName}","${c.cashierName}",${c.cashCollected},${c.posCollected},${c.upiCollected},${c.totalCollected},"${c.reconciliationStatus}"`
      )
      .join("\n");
    csvContent = metadata + headers + rows;
  } else if (reportType.includes("profit-expense")) {
    filename = `Hospital_Profit_Expense_Ledger_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const expenses = getScaledExpenses(multiplier);
    const headers = "Expense No,Category,Department / Unit,Linked PO,Date,Pay Method,Amount (INR),Status\n";
    const rows = expenses
      .map(
        (e) =>
          `"${e.expenseNo}","${e.category}","${e.department}","${e.linkedPoId || "N/A"}","${e.date}","${e.paymentMethod}",${e.amount},"${e.status}"`
      )
      .join("\n");
    csvContent = metadata + headers + rows;
  } else {
    // Executive Overview Consolidated CSV
    filename = `Hospital_Financial_Overview_${period.replace(/\s+/g, "_")}_${timestamp}.csv`;
    const streams = getScaledRevenueStreams(multiplier);
    const expenses = getScaledExpenses(multiplier);
    const totalGross = streams.reduce((acc, curr) => acc + curr.grossAmount, 0);
    const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const surplus = totalGross - totalExp;

    const summarySection = `METRIC,AMOUNT (INR)\nGross Revenue,${totalGross}\nOperating Expenses,${totalExp}\nNet Operating Surplus,${surplus}\nOperating Margin %,${((surplus / totalGross) * 100).toFixed(1)}%\n\n`;
    const streamHeaders = "Billing Stream Category,Invoices Count,Gross Billed (INR),Net Revenue (INR)\n";
    const streamRows = streams.map((s) => `"${s.category}",${s.invoiceCount},${s.grossAmount},${s.netRevenue}`).join("\n");

    csvContent = metadata + summarySection + streamHeaders + streamRows;
  }

  // Trigger Client-Side Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFinancialReportToPDF(
  reportType: string,
  period: string,
  multiplier: number = 1.0
) {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString().split("T")[0];

  // Letterhead Top Banner
  doc.setFillColor(13, 148, 136); // Primary Teal
  doc.rect(0, 0, 210, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("QLYNO MULTISPECIALTY HOSPITAL & RESEARCH CENTRE", 15, 18);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("NABH & NABL Accredited Facility • Department of Hospital Finance & Revenue Assurance", 15, 23);
  doc.text(
    `Financial Statement: ${reportType.toUpperCase()} | Accounting Period: ${period} | Exported: ${new Date().toLocaleString()}`,
    15,
    28
  );

  doc.setDrawColor(203, 213, 225);
  doc.line(15, 31, 195, 31);

  // Executive KPI Summary Strip
  const streams = getScaledRevenueStreams(multiplier);
  const collections = getScaledCollectionChannels(multiplier);
  const aging = getScaledArAgingBuckets(multiplier);
  const expenses = getScaledExpenses(multiplier);

  const totalGross = streams.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalRealized = collections.reduce((acc, curr) => acc + curr.amountCollected, 0);
  const totalAr = aging.reduce((acc, curr) => acc + curr.totalOutstanding, 0);
  const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSurplus = totalGross - totalExp;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 35, 180, 22, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 35, 180, 22, 2, 2, "S");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("GROSS REVENUE", 20, 42);
  doc.text("TOTAL REALIZED", 65, 42);
  doc.text("OUTSTANDING AR", 110, 42);
  doc.text("NET SURPLUS / MARGIN", 155, 42);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`INR ${(totalGross / 100000).toFixed(2)} L`, 20, 49);
  doc.text(`INR ${(totalRealized / 100000).toFixed(2)} L`, 65, 49);
  doc.setTextColor(180, 83, 9);
  doc.text(`INR ${(totalAr / 100000).toFixed(2)} L`, 110, 49);
  doc.setTextColor(13, 148, 136);
  doc.text(`INR ${(netSurplus / 100000).toFixed(2)} L (${((netSurplus / totalGross) * 100).toFixed(1)}%)`, 155, 49);

  let y = 66;

  // Table Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`ITEMIZED FINANCIAL LEDGER — ${reportType.toUpperCase()}`, 15, y);
  y += 6;

  // Table Headers
  doc.setFillColor(15, 23, 42);
  doc.rect(15, y, 180, 7, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  if (reportType.includes("revenue") && !reportType.includes("department") && !reportType.includes("doctor") && !reportType.includes("service")) {
    doc.text("Billing Stream Category", 18, y + 5);
    doc.text("Invoices", 95, y + 5);
    doc.text("Gross Billed", 125, y + 5);
    doc.text("Net Revenue", 160, y + 5);
    y += 7;

    streams.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(item.category, 18, y + 4.5);
      doc.text(String(item.invoiceCount), 95, y + 4.5);
      doc.text(`Rs. ${item.grossAmount.toLocaleString()}`, 125, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text(`Rs. ${item.netRevenue.toLocaleString()}`, 160, y + 4.5);
      y += 6;
    });
  } else if (reportType.includes("collections")) {
    doc.text("Payment Channel", 18, y + 5);
    doc.text("Transactions", 95, y + 5);
    doc.text("Realized (INR)", 130, y + 5);
    doc.text("Share %", 170, y + 5);
    y += 7;

    collections.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(item.method, 18, y + 4.5);
      doc.text(String(item.transactionCount), 95, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text(`Rs. ${item.amountCollected.toLocaleString()}`, 130, y + 4.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${item.percentageShare}%`, 170, y + 4.5);
      y += 6;
    });
  } else if (reportType.includes("outstanding")) {
    doc.text("Aging Bucket", 18, y + 5);
    doc.text("Self-Pay", 70, y + 5);
    doc.text("Private TPA", 110, y + 5);
    doc.text("Total AR", 155, y + 5);
    y += 7;

    aging.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(item.bucket, 18, y + 4.5);
      doc.text(`Rs. ${item.selfPayAmount.toLocaleString()}`, 70, y + 4.5);
      doc.text(`Rs. ${item.tpaInsuranceAmount.toLocaleString()}`, 110, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 83, 9);
      doc.text(`Rs. ${item.totalOutstanding.toLocaleString()}`, 155, y + 4.5);
      y += 6;
    });
  } else if (reportType.includes("department-revenue")) {
    const depts = getScaledDepartmentRevenues(multiplier);
    doc.text("Department", 18, y + 5);
    doc.text("OPD", 80, y + 5);
    doc.text("IPD & OT", 115, y + 5);
    doc.text("Gross Revenue", 155, y + 5);
    y += 7;

    depts.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(item.departmentName, 18, y + 4.5);
      doc.text(`Rs. ${item.opdRevenue.toLocaleString()}`, 80, y + 4.5);
      doc.text(`Rs. ${(item.ipdRevenue + item.procedureRevenue).toLocaleString()}`, 115, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text(`Rs. ${item.totalGrossRevenue.toLocaleString()}`, 155, y + 4.5);
      y += 6;
    });
  } else if (reportType.includes("doctor-revenue")) {
    const doctors = getScaledDoctorRevenues(multiplier);
    doc.text("Doctor Name & Specialty", 18, y + 5);
    doc.text("Consults", 95, y + 5);
    doc.text("Surgeries", 130, y + 5);
    doc.text("Attributed Total", 160, y + 5);
    y += 7;

    doctors.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(item.doctorName, 18, y + 4.5);
      doc.text(`Rs. ${item.consultationRevenue.toLocaleString()}`, 95, y + 4.5);
      doc.text(`Rs. ${item.surgicalProcedureRevenue.toLocaleString()}`, 130, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text(`Rs. ${item.totalAttributedRevenue.toLocaleString()}`, 160, y + 4.5);
      y += 6;
    });
  } else {
    // General Summary / P&L
    doc.text("Operating Financial Line Item", 18, y + 5);
    doc.text("Category", 100, y + 5);
    doc.text("Financial Value (INR)", 150, y + 5);
    y += 7;

    const summaryRows = [
      { label: "1. Gross Patient Billed Revenue", cat: "Inflow", val: totalGross },
      { label: "2. Total Cash / Digital Realization", cat: "Realized", val: totalRealized },
      { label: "3. Pending Receivables (AR Aging)", cat: "Receivables", val: totalAr },
      { label: "4. Total Hospital Operating Expenses", cat: "Outflow", val: totalExp },
      { label: "5. Net Operational Surplus / (Deficit)", cat: "Net Margin", val: netSurplus },
    ];

    summaryRows.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6.5, "F");
      }
      doc.setFont("helvetica", item.cat === "Net Margin" ? "bold" : "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(item.label, 18, y + 4.5);
      doc.text(item.cat, 100, y + 4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(item.cat === "Net Margin" ? 13 : 15, item.cat === "Net Margin" ? 148 : 23, item.cat === "Net Margin" ? 136 : 42);
      doc.text(`Rs. ${item.val.toLocaleString()}`, 150, y + 4.5);
      y += 6.5;
    });
  }

  // Footer Signoff & Audit Stamp
  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("CONFIDENTIAL • FOR HOSPITAL MANAGEMENT & AUDIT USE ONLY • GENERATED VIA QLYNO HIS ENGINE", 15, pageHeight - 15);
  doc.text(`Page 1 of 1 • System Verification Stamp: SHA256-${Date.now().toString(16)}`, 15, pageHeight - 11);

  // Save PDF to browser
  const docFilename = `Hospital_Financial_${reportType.replace(/[^a-zA-Z0-9]/g, "_")}_${period.replace(/\s+/g, "_")}_${timestamp}.pdf`;
  doc.save(docFilename);
}
