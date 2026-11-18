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

  const advanceExpensesTotal = expenses
    .filter(e => e.paymentMode === "firm_advance" || Boolean(e.advanceDeducted))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const selfExpensesTotal = expenses
    .filter(e => e.paymentMode !== "firm_advance" && !e.advanceDeducted)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalAdvanceDisbursed = advances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const totalAdvanceUsed = advances.reduce((sum, a) => {
    const fromExp = expenses
      .filter((e) => e.advanceId === a.id && (e.paymentMode === "firm_advance" || Boolean(e.advanceDeducted)))
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    return sum + (fromExp > 0 ? fromExp : Number(a.usedAmount || 0));
  }, 0);
  const totalAdvanceBalance = Math.max(0, totalAdvanceDisbursed - totalAdvanceUsed);

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
    ["FINANCIAL AGGREGATES & CASHFLOW", `AMOUNT (${currency})`],
    ["Total Expenses Recorded", totalAmount],
    ["  - Deducted from Firm Advance Float", advanceExpensesTotal],
    ["  - Paid from Staff Self (Reimbursement Due)", selfExpensesTotal],
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

// Helper: Convert Hex color to RGB tuple
export const hexToRgb = (hex, fallback = [15, 41, 66]) => {
  if (!hex || typeof hex !== "string") return fallback;
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ];
  }
  return fallback;
};

// Default PDF Layout Configuration
export const DEFAULT_PDF_LAYOUT = {
  orientation: "portrait", // "portrait" | "landscape"
  format: "a4", // "a4" | "letter" | "legal"
  marginMm: 14, // 10 to 25 mm
  primaryColor: "#0f2942", // Navy
  accentColor: "#c99738", // Gold
  bannerStyle: "full_banner", // "full_banner" | "minimal" | "boxed" | "double_rule"
  bannerHeight: 28, // 20 to 45 mm
  headerTitle: "", // Custom override or empty to use firmName
  headerTitleFontSize: 13,
  showAddress: true,
  showDateStatus: true,
  statementTitle: "", // Empty defaults to reportHeader
  statementTitleFontSize: 11,
  showFilterBox: true,
  showKpiCards: true,
  tableTheme: "striped", // "striped" | "grid" | "plain"
  tableFontSize: 7.5,
  tableHeaderFontSize: 8,
  tableCellPadding: 2, // mm
  alternateRowColor: "#f8fafc",
  showColumnIndex: true,
  showColumnDate: true,
  showColumnCase: true,
  showColumnDescription: true,
  showColumnCategory: true,
  showColumnPaymentMode: true,
  showColumnStaffName: true,
  showColumnAmount: true,
  showDisclaimer: true,
  disclaimerFontSize: 6.8,
  disclaimerItalic: true,
  showSignatures: true,
  signatureCount: 3, // 2 or 3
  signer1Label: "", // Empty defaults to settings.signaturePreparedBy
  signer2Label: "", // Empty defaults to settings.signatureVerifiedBy
  signer3Label: "", // Empty defaults to settings.signatureApprovedBy
  showSignatureDates: true,
  showFooter: true,
  footerText: "Confidential Client Disbursement Record • Attorney-Client Privileged",
  footerFontSize: 7,
};

// ==================== PDF REPORT EXPORT ====================
export const exportExpensesToPDF = ({
  expenses = [],
  advances = [],
  settings = {},
  filterSummary = {},
  fileName = "lawfirm_expense_voucher_statement",
  returnDoc = false,
}) => {
  const custom = settings.pdfLayout || {};
  const layout = { ...DEFAULT_PDF_LAYOUT, ...custom };

  const primaryColor = hexToRgb(layout.primaryColor, [15, 41, 66]);
  const accentGold = hexToRgb(layout.accentColor, [201, 151, 56]);
  const altRowColor = hexToRgb(layout.alternateRowColor, [248, 250, 252]);

  const doc = new jsPDF({
    orientation: layout.orientation || "portrait",
    unit: "mm",
    format: layout.format || "a4",
  });

  const currency = settings.currencySymbol || "₹";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = Math.max(8, Math.min(30, Number(layout.marginMm) || 14));
  const contentWidth = pageWidth - (margin * 2);

  // 1. Header Banner Rendering
  const firmTitle = (layout.headerTitle || settings.firmName || "LEXVERITAS & PARTNERS ADVOCATES").toUpperCase();
  const tagline = settings.tagline || "Advocates & Legal Consultants | Litigation & Technical Advisory";
  const address = settings.firmAddress || "High Court Chamber Complex";
  const bannerHeight = Math.max(20, Math.min(50, Number(layout.bannerHeight) || 28));

  let currentY = margin;

  if (layout.bannerStyle === "full_banner") {
    // Solid colored full-width header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, bannerHeight, "F");

    // Subtle gold bottom accent border
    doc.setDrawColor(...accentGold);
    doc.setLineWidth(0.8);
    doc.line(0, bannerHeight, pageWidth, bannerHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(Number(layout.headerTitleFontSize) || 13);
    doc.setTextColor(255, 255, 255);
    doc.text(firmTitle, margin, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(220, 230, 242);
    doc.text(tagline, margin, 17.5);

    if (layout.showAddress) {
      doc.text(address, margin, 22.5);
    }

    if (layout.showDateStatus) {
      doc.setFontSize(7.5);
      doc.setTextColor(230, 240, 250);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 12, { align: "right" });
      doc.text(`Status: Certified Final`, pageWidth - margin, 17.5, { align: "right" });
    }

    currentY = bannerHeight + 8;
  } else if (layout.bannerStyle === "boxed") {
    // Elegant framed box
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.7);
    doc.setFillColor(252, 253, 255);
    doc.roundedRect(margin, currentY, contentWidth, bannerHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(Number(layout.headerTitleFontSize) || 13);
    doc.setTextColor(...primaryColor);
    doc.text(firmTitle, margin + 4, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 80, 95);
    doc.text(tagline, margin + 4, currentY + 12.5);

    if (layout.showAddress) {
      doc.text(address, margin + 4, currentY + 17.5);
    }

    if (layout.showDateStatus) {
      doc.setFontSize(7.5);
      doc.setTextColor(...accentGold);
      doc.text(`Certified Report • ${new Date().toLocaleDateString()}`, pageWidth - margin - 4, currentY + 7, { align: "right" });
    }

    currentY += bannerHeight + 7;
  } else if (layout.bannerStyle === "double_rule") {
    // Classical High Court double rule
    doc.setFont("helvetica", "bold");
    doc.setFontSize(Number(layout.headerTitleFontSize) || 14);
    doc.setTextColor(...primaryColor);
    doc.text(firmTitle, margin, currentY + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 70, 85);
    doc.text(tagline, margin, currentY + 9.5);

    if (layout.showAddress) {
      doc.text(address, margin, currentY + 14.5);
    }

    if (layout.showDateStatus) {
      doc.setFontSize(7.5);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, currentY + 4, { align: "right" });
    }

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY + 17, pageWidth - margin, currentY + 17);
    doc.setDrawColor(...accentGold);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + 18.2, pageWidth - margin, currentY + 18.2);

    currentY += 24;
  } else {
    // Minimalist clean style
    doc.setFont("helvetica", "bold");
    doc.setFontSize(Number(layout.headerTitleFontSize) || 13);
    doc.setTextColor(...primaryColor);
    doc.text(firmTitle, margin, currentY + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 100);
    doc.text(tagline, margin, currentY + 9.5);

    if (layout.showAddress) {
      doc.text(address, margin, currentY + 14.5);
    }

    if (layout.showDateStatus) {
      doc.setFontSize(7.5);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, currentY + 4, { align: "right" });
    }

    doc.setDrawColor(210, 220, 230);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY + 17, pageWidth - margin, currentY + 17);

    currentY += 23;
  }

  // 2. Statement Title
  const statementTitle = layout.statementTitle || settings.reportHeader || "EXPENDITURE & ADVANCE RECONCILIATION STATEMENT";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(Number(layout.statementTitleFontSize) || 10.5);
  doc.setTextColor(...primaryColor);
  doc.text(statementTitle, margin, currentY);

  currentY += 5.5;

  // 3. Filter Summary Box (Optional)
  if (layout.showFilterBox !== false) {
    doc.setFillColor(246, 248, 251);
    doc.setDrawColor(220, 226, 235);
    doc.roundedRect(margin, currentY, contentWidth, 15, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(70, 80, 95);
    doc.text("Matter / Case:", margin + 4, currentY + 5.5);
    doc.text("Period:", margin + 4, currentY + 11);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 25, 35);
    doc.text(filterSummary.caseName || "All Active Matters", margin + 28, currentY + 5.5);
    doc.text(`${filterSummary.startDate || "Beginning"} to ${filterSummary.endDate || "Present"}`, margin + 28, currentY + 11);

    const midX = margin + (contentWidth / 2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(70, 80, 95);
    doc.text("Staff Member:", midX, currentY + 5.5);
    doc.text("Classification:", midX, currentY + 11);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 25, 35);
    doc.text(filterSummary.staffName || "All Firm Staff", midX + 24, currentY + 5.5);
    doc.text(filterSummary.categoryType ? filterSummary.categoryType.toUpperCase() : "ALL CATEGORIES", midX + 24, currentY + 11);

    currentY += 20;
  } else {
    currentY += 3;
  }

  // 4. Financial KPI Summary Cards (Optional)
  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const legalTotal = expenses
    .filter(e => e.categoryType === "legal")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const techTotal = expenses
    .filter(e => e.categoryType === "technical")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const fromAdvanceTotal = expenses
    .filter(e => e.paymentMode === "firm_advance" || Boolean(e.advanceDeducted))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const fromSelfTotal = expenses
    .filter(e => e.paymentMode !== "firm_advance" && !e.advanceDeducted)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  if (layout.showKpiCards !== false) {
    const cardGap = 3;
    const cardWidth = (contentWidth - (cardGap * 3)) / 4;
    const cards = [
      { label: "Total Incurred", val: `${currency} ${totalAmount.toLocaleString()}`, color: primaryColor },
      { label: "Legal Expenses", val: `${currency} ${legalTotal.toLocaleString()}`, color: [30, 70, 130] },
      { label: "Technical / Audit", val: `${currency} ${techTotal.toLocaleString()}`, color: [180, 83, 9] },
      { label: "Advance Settled", val: `${currency} ${fromAdvanceTotal.toLocaleString()}`, color: [16, 120, 70] },
    ];

    cards.forEach((c, idx) => {
      const cardX = margin + idx * (cardWidth + cardGap);
      doc.setFillColor(248, 250, 253);
      doc.setDrawColor(215, 225, 235);
      doc.roundedRect(cardX, currentY, cardWidth, 13, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.2);
      doc.setTextColor(85, 95, 110);
      doc.text(c.label.toUpperCase(), cardX + 3, currentY + 4.2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...c.color);
      doc.text(c.val, cardX + 3, currentY + 9.8);
    });

    currentY += 17;
  }

  // 5. Dynamic Table Columns based on settings
  const columnsConfig = [];
  if (layout.showColumnIndex !== false) columnsConfig.push({ id: "idx", title: "#", widthWeight: 0.8, align: "center" });
  if (layout.showColumnDate !== false) columnsConfig.push({ id: "date", title: "Date", widthWeight: 1.6, align: "left" });
  if (layout.showColumnCase !== false) columnsConfig.push({ id: "case", title: "Case / Matter", widthWeight: 3.5, align: "left" });
  if (layout.showColumnDescription !== false) columnsConfig.push({ id: "desc", title: "Description / Purpose", widthWeight: 4.2, align: "left" });
  if (layout.showColumnCategory !== false) columnsConfig.push({ id: "cat", title: "Category", widthWeight: 2.6, align: "left" });
  if (layout.showColumnPaymentMode !== false) columnsConfig.push({ id: "mode", title: "Mode", widthWeight: 1.8, align: "left" });
  if (layout.showColumnStaffName !== false) columnsConfig.push({ id: "staff", title: "Associate", widthWeight: 2.2, align: "left" });
  if (layout.showColumnAmount !== false) columnsConfig.push({ id: "amount", title: `Amount (${currency})`, widthWeight: 2.2, align: "right" });

  const totalWeight = columnsConfig.reduce((sum, c) => sum + c.widthWeight, 0) || 1;
  const columnStyles = {};
  columnsConfig.forEach((col, i) => {
    columnStyles[i] = {
      cellWidth: (col.widthWeight / totalWeight) * contentWidth,
      halign: col.align,
      fontStyle: col.id === "amount" ? "bold" : "normal",
    };
  });

  const tableHeaders = [columnsConfig.map(c => c.title)];
  const tableRows = expenses.map((exp, idx) => {
    const row = [];
    columnsConfig.forEach(col => {
      switch (col.id) {
        case "idx": row.push(idx + 1); break;
        case "date": row.push(exp.date || ""); break;
        case "case": row.push((exp.caseTitle || exp.caseId || "").substring(0, 32)); break;
        case "desc": row.push((exp.name || "").substring(0, 40)); break;
        case "cat": row.push(exp.category || ""); break;
        case "mode": row.push(exp.paymentMode === "firm_advance" ? "Advance" : (exp.paymentMode || "Cash")); break;
        case "staff": row.push((exp.staffName || "").substring(0, 20)); break;
        case "amount": row.push(Number(exp.amount || 0).toLocaleString()); break;
        default: break;
      }
    });
    return row;
  });

  doc.autoTable({
    startY: currentY,
    head: tableHeaders,
    body: tableRows,
    theme: layout.tableTheme || "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: Number(layout.tableHeaderFontSize) || 8,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: Number(layout.tableFontSize) || 7.5,
      textColor: [30, 35, 45],
      cellPadding: Number(layout.tableCellPadding) || 2,
    },
    columnStyles: columnStyles,
    alternateRowStyles: {
      fillColor: altRowColor,
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      if (layout.showFooter !== false) {
        const totalPages = doc.internal.getNumberOfPages();
        doc.setFontSize(Number(layout.footerFontSize) || 7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 140, 155);
        const footerNotice = layout.footerText || "Confidential Client Disbursement Record • Attorney-Client Privileged";
        doc.text(
          `Page ${data.pageNumber} of ${totalPages} • ${footerNotice}`,
          pageWidth / 2,
          pageHeight - 7,
          { align: "center" }
        );
      }
    },
  });

  let finalY = doc.lastAutoTable.finalY + 7;

  // 6. Legal Disclaimer & Signatures block
  if (finalY > pageHeight - 45) {
    doc.addPage();
    finalY = margin + 5;
  }

  if (layout.showDisclaimer !== false) {
    doc.setFont("helvetica", layout.disclaimerItalic !== false ? "italic" : "normal");
    doc.setFontSize(Number(layout.disclaimerFontSize) || 6.8);
    doc.setTextColor(100, 110, 125);
    const disclaimerText = settings.reportDisclaimer || "Certified that the above expenditures were strictly incurred in the discharge of professional legal services.";
    const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth);
    doc.text(splitDisclaimer, margin, finalY);
    finalY += splitDisclaimer.length * 3.8 + 6;
  }

  // 7. Signature Blocks (Optional)
  if (layout.showSignatures !== false) {
    const sigCount = Number(layout.signatureCount) === 2 ? 2 : 3;
    const signer1 = layout.signer1Label || settings.signaturePreparedBy || "Prepared by Staff Associate";
    const signer2 = layout.signer2Label || settings.signatureVerifiedBy || "Verified by Accounts Admin (Boss)";
    const signer3 = layout.signer3Label || settings.signatureApprovedBy || "Approved by Managing Partner";

    doc.setDrawColor(180, 190, 205);
    doc.setLineWidth(0.6);

    if (sigCount === 2) {
      const sig1X = margin;
      const sig2X = pageWidth - margin - 50;

      doc.line(sig1X, finalY + 10, sig1X + 50, finalY + 10);
      doc.line(sig2X, finalY + 10, sig2X + 50, finalY + 10);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(55, 65, 80);
      doc.text(signer1, sig1X, finalY + 14);
      doc.text(signer2, sig2X, finalY + 14);

      if (layout.showSignatureDates !== false) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(120, 130, 145);
        doc.text("Date: ____________", sig1X, finalY + 18);
        doc.text("Date: ____________", sig2X, finalY + 18);
      }
    } else {
      const sigWidth = 46;
      const sig1X = margin;
      const sig2X = (pageWidth / 2) - (sigWidth / 2);
      const sig3X = pageWidth - margin - sigWidth;

      doc.line(sig1X, finalY + 10, sig1X + sigWidth, finalY + 10);
      doc.line(sig2X, finalY + 10, sig2X + sigWidth, finalY + 10);
      doc.line(sig3X, finalY + 10, sig3X + sigWidth, finalY + 10);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      doc.setTextColor(55, 65, 80);
      doc.text(signer1, sig1X, finalY + 14);
      doc.text(signer2, sig2X, finalY + 14);
      doc.text(signer3, sig3X, finalY + 14);

      if (layout.showSignatureDates !== false) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(120, 130, 145);
        doc.text("Date: ____________", sig1X, finalY + 18);
        doc.text("Date: ____________", sig2X, finalY + 18);
        doc.text("Date: ____________", sig3X, finalY + 18);
      }
    }
  }

  if (returnDoc) {
    return doc;
  }

  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`${fileName}_${dateStr}.pdf`);
  return doc;
};

// ==================== GENERATE SAMPLE PDF ====================
export const generateSamplePDF = (settings) => {
  const sampleExpenses = [
    {
      id: "EXP-89012",
      date: new Date().toISOString().split("T")[0],
      caseTitle: "Union of India v. ABC Infrastructure",
      name: "Supreme Court Special Leave Petition Paper Book Certified Copies",
      category: "Court & Filing Fees",
      categoryType: "legal",
      paymentMode: "firm_advance",
      staffName: "Adv. Arjun Mehra",
      amount: 45000,
    },
    {
      id: "EXP-89013",
      date: new Date().toISOString().split("T")[0],
      caseTitle: "State Bank v. Zenith Global",
      name: "Senior Advocate Consultation Briefing Conference",
      category: "Counsel & Senior Briefing",
      categoryType: "legal",
      paymentMode: "bank_transfer",
      staffName: "Adv. Priya Sharma",
      amount: 125000,
    },
    {
      id: "EXP-89014",
      date: new Date().toISOString().split("T")[0],
      caseTitle: "Tech Mahindra v. Innovatech",
      name: "Encrypted Cloud Server Digital Evidence Recovery & Forensic Report",
      category: "Digital Forensics & Discovery",
      categoryType: "technical",
      paymentMode: "online",
      staffName: "Karan Patel (Forensic Lead)",
      amount: 85000,
    },
    {
      id: "EXP-89015",
      date: new Date().toISOString().split("T")[0],
      caseTitle: "General Office",
      name: "Arbitration Tribunal Hearing Transcripts & Court Stenographer Fee",
      category: "Stenography & Transcription",
      categoryType: "administrative",
      paymentMode: "cash",
      staffName: "Adv. Arjun Mehra",
      amount: 18500,
    },
  ];

  const sampleAdvances = [
    { id: "ADV-01", staffName: "Adv. Arjun Mehra", amount: 60000, usedAmount: 45000 },
  ];

  return exportExpensesToPDF({
    expenses: sampleExpenses,
    advances: sampleAdvances,
    settings: settings,
    filterSummary: {
      caseName: "All Pre-Approved Firm Matters",
      staffName: "All Active Associates",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      categoryType: "Legal & Technical",
    },
    fileName: "lawfirm_pdf_layout_sample",
  });
};
