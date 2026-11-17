import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ==================== EXCEL EXPORT ====================
export const exportExpensesToExcel = ({
  expenses = [],
  advances = [],
  settings = {},
  filterSummary = {},
  fileName = "lawfirm_expense_report"
}) => {
  const currency = settings.currencySymbol || "₹";
  const wb = XLSX.utils.book_new();

  // 1. Prepare Summary Sheet Data
  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const legalTotal = expenses
    .filter(e => e.categoryType === "legal")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const techTotal = expenses
    .filter(e => e.categoryType === "technical")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const adminTotal = totalAmount - legalTotal - techTotal;

  const totalAdvanceDisbursed = advances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const totalAdvanceUsed = advances.reduce((sum, a) => sum + (Number(a.usedAmount) || 0), 0);
  const totalAdvanceBalance = totalAdvanceDisbursed - totalAdvanceUsed;

  const summaryData = [
    [settings.firmName || "LAW FIRM EXPENDITURE STATEMENT"],
    [settings.tagline || ""],
    [settings.firmAddress || ""],
    ["Generated On", new Date().toLocaleString()],
    [],
    ["REPORT FILTER METADATA", ""],
    ["Case Filter", filterSummary.caseName || "All Cases"],
    ["Staff Filter", filterSummary.staffName || "All Staff"],
    ["Date Range", `${filterSummary.startDate || "Beginning"} to ${filterSummary.endDate || "Present"}`],
    ["Category Filter", filterSummary.category || "All Categories"],
    [],
    ["FINANCIAL AGGREGATES", `AMOUNT (${currency})`],
    ["Total Expenses Recorded", totalAmount],
    ["  - Legal Fees & Court Expenses", legalTotal],
    ["  - Technical & Forensic Expenses", techTotal],
    ["  - Administrative & Other Out-of-Pocket", adminTotal],
    [],
    ["ADVANCE RECONCILIATION SUMMARY", `AMOUNT (${currency})`],
    ["Total Advances Disbursed", totalAdvanceDisbursed],
    ["Total Advance Amount Absorbed", totalAdvanceUsed],
    ["Net Outstanding Advance Float", totalAdvanceBalance],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Financial Overview");

  // 2. Prepare Itemized Expenses Sheet Data
  const expenseRows = expenses.map((exp, index) => ({
    "Sl No": index + 1,
    "Date": exp.date,
    "Time": exp.time || "N/A",
    "Case ID": exp.caseId || "N/A",
    "Case / Matter Title": exp.caseTitle || "N/A",
    "Expense Description": exp.name,
    "Classification": exp.categoryType ? exp.categoryType.toUpperCase() : "GENERAL",
    "Category Name": exp.category,
    [`Amount (${currency})`]: Number(exp.amount) || 0,
    "Payment Mode": exp.paymentMode === "firm_advance" ? "Firm Advance" : exp.paymentMode?.toUpperCase() || "CASH",
    "Linked Advance ID": exp.advanceId || "None (Out-of-Pocket)",
    "Staff Member": exp.staffName,
    "Staff Email": exp.staffEmail,
    "Status": exp.status ? exp.status.toUpperCase() : "APPROVED",
    "Notes / Vouchers": exp.notes || ""
  }));

  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, wsExpenses, "Itemized Expenses");

  // 3. Prepare Advances & Float Sheet Data
  if (advances && advances.length > 0) {
    const advanceRows = advances.map((adv, index) => ({
      "Sl No": index + 1,
      "Advance ID": adv.id,
      "Staff Name": adv.staffName,
      "Disbursed Date": adv.disbursedDate,
      "Earmarked Case": adv.caseTitle || (adv.caseId === "ALL" ? "General Office Float" : adv.caseId),
      [`Original Advance (${currency})`]: Number(adv.amount) || 0,
      [`Utilized in Expenses (${currency})`]: Number(adv.usedAmount) || 0,
      [`Remaining Balance (${currency})`]: (Number(adv.amount) || 0) - (Number(adv.usedAmount) || 0),
      "Status": adv.status ? adv.status.toUpperCase() : "ACTIVE",
      "Disbursed By": adv.disbursedBy || "Managing Partner",
      "Notes": adv.notes || ""
    }));

    const wsAdvances = XLSX.utils.json_to_sheet(advanceRows);
    XLSX.utils.book_append_sheet(wb, wsAdvances, "Staff Advances Float");
  }

  // Trigger download
  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `${fileName}_${dateStr}.xlsx`);
};

// ==================== PDF REPORT EXPORT ====================
export const exportExpensesToPDF = ({
  expenses = [],
  advances = [],
  settings = {},
  filterSummary = {},
  fileName = "lawfirm_expense_voucher_statement"
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const currency = settings.currencySymbol || "Rs.";
  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Theme Color (Default Navy Blue)
  const primaryColor = [15, 41, 66];
  const accentGold = [201, 151, 56];

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text((settings.firmName || "LEXVERITAS & PARTNERS ADVOCATES").toUpperCase(), 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(215, 225, 235);
  doc.text(settings.tagline || "Advocates & Legal Consultants | Litigation & Technical Advisory", 14, 18);
  doc.text(settings.firmAddress || "High Court Chamber Complex", 14, 23);

  // Date on the right
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 12, { align: "right" });
  doc.text(`Status: Certified Final`, pageWidth - 14, 18, { align: "right" });

  let currentY = 36;

  // Title Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(settings.reportHeader || "EXPENDITURE & ADVANCE RECONCILIATION STATEMENT", 14, currentY);

  currentY += 6;

  // Filter Summary Box
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(70, 80, 95);
  doc.text("Matter / Case:", 18, currentY + 6);
  doc.text("Period:", 18, currentY + 12);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 25, 35);
  doc.text(filterSummary.caseName || "All Active Matters", 42, currentY + 6);
  doc.text(`${filterSummary.startDate || "Beginning"} to ${filterSummary.endDate || "Present"}`, 42, currentY + 12);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 80, 95);
  doc.text("Staff Member:", 110, currentY + 6);
  doc.text("Category Type:", 110, currentY + 12);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 25, 35);
  doc.text(filterSummary.staffName || "All Law Firm Staff", 136, currentY + 6);
  doc.text(filterSummary.categoryType ? filterSummary.categoryType.toUpperCase() : "ALL EXPENSES", 136, currentY + 12);

  currentY += 22;

  // KPI Totals
  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const legalTotal = expenses
    .filter(e => e.categoryType === "legal")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const techTotal = expenses
    .filter(e => e.categoryType === "technical")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const fromAdvanceTotal = expenses
    .filter(e => e.paymentMode === "firm_advance" || e.advanceId)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 4 KPI Cards
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cards = [
    { label: "Total Incurred", val: `${currency} ${totalAmount.toLocaleString()}`, color: [15, 41, 66] },
    { label: "Legal Expenses", val: `${currency} ${legalTotal.toLocaleString()}`, color: [30, 70, 120] },
    { label: "Technical Expenses", val: `${currency} ${techTotal.toLocaleString()}`, color: [180, 83, 9] },
    { label: "Advance Settled", val: `${currency} ${fromAdvanceTotal.toLocaleString()}`, color: [16, 120, 70] },
  ];

  cards.forEach((c, idx) => {
    const cardX = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(210, 220, 230);
    doc.roundedRect(cardX, currentY, cardWidth, 14, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(90, 100, 115);
    doc.text(c.label.toUpperCase(), cardX + 3, currentY + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...c.color);
    doc.text(c.val, cardX + 3, currentY + 10.5);
  });

  currentY += 19;

  // Table of Expenses
  const tableHeaders = [
    ["#", "Date", "Case / Matter", "Expense Description", "Category", "Paid By", `Amount (${currency})`]
  ];

  const tableRows = expenses.map((exp, idx) => [
    idx + 1,
    exp.date,
    (exp.caseTitle || exp.caseId || "").substring(0, 25),
    (exp.name || "").substring(0, 30),
    exp.categoryType ? `[${exp.categoryType[0].toUpperCase()}] ${exp.category}` : exp.category,
    exp.paymentMode === "firm_advance" ? "Advance" : (exp.paymentMode || "Cash"),
    `${Number(exp.amount).toLocaleString()}`
  ]);

  doc.autoTable({
    startY: currentY,
    head: tableHeaders,
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "left"
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 35, 45],
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 18 },
      2: { cellWidth: 42 },
      3: { cellWidth: 50 },
      4: { cellWidth: 32 },
      5: { cellWidth: 18 },
      6: { cellWidth: 20, halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 253]
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(130, 140, 155);
      doc.text(
        `Page ${data.pageNumber} of ${totalPages} • Confidential Client Disbursement Record`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }
  });

  let finalY = doc.lastAutoTable.finalY + 8;

  // Check page overflow for signature block
  if (finalY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    finalY = 20;
  }

  // Legal Disclaimer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  doc.setTextColor(110, 120, 135);
  const disclaimerText = settings.reportDisclaimer || "Certified that the above expenditures were strictly incurred in the discharge of professional legal services.";
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - 28);
  doc.text(splitDisclaimer, 14, finalY);

  finalY += splitDisclaimer.length * 4 + 8;

  // Signatures
  doc.setDrawColor(180, 190, 205);
  doc.line(14, finalY + 12, 60, finalY + 12);
  doc.line(pageWidth / 2 - 23, finalY + 12, pageWidth / 2 + 23, finalY + 12);
  doc.line(pageWidth - 60, finalY + 12, pageWidth - 14, finalY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 70, 85);
  doc.text("Prepared By (Staff)", 14, finalY + 16);
  doc.text("Verified by Accounts Admin", pageWidth / 2, finalY + 16, { align: "center" });
  doc.text("Approved by Managing Partner", pageWidth - 14, finalY + 16, { align: "right" });

  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`${fileName}_${dateStr}.pdf`);
};
