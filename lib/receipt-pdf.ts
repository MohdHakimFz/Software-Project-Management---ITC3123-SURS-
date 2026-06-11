import { jsPDF } from "jspdf";
import { formatCurrency, formatDateLong, formatDateTime } from "@/lib/utils";

export interface ReceiptData {
  receiptNumber: string;
  paidAt: string | null;
  createdAt: string;
  semester: string;
  studentName: string;
  studentId: string;
  email: string;
  phone?: string | null;
  programmeName?: string;
  tuitionAmount: number;
  registrationAmount: number;
  resourceAmount: number;
  totalAmount: number;
  totalCredits?: number;
  stripePaymentIntentId?: string | null;
  stripeSessionId?: string | null;
  paymentMethod?: string;
  isTestMode?: boolean;
}

const ISSUER = {
  name: "Universiti Poly-Tech Malaysia (UPTM)",
  system: "Smart University Registration System (SURS)",
  address: ["Jalan 6/91, Taman Shamelin Perkasa", "56100 Kuala Lumpur", "Malaysia"],
  email: "finance@uptm.edu.my",
} as const;

const NAVY: [number, number, number] = [0, 51, 102];
const MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [226, 232, 240];

function stripeRef(id: string | null | undefined): string {
  if (!id) return "—";
  return id.replace(/^pi_/, "").slice(-12).toUpperCase();
}

function drawLogoMark(doc: jsPDF, x: number, y: number, size: number) {
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, size, size, 2, 2, "F");

  const inset = 1.4;
  const inner = size - inset * 2;
  doc.setFillColor(...NAVY);
  doc.roundedRect(x + inset, y + inset, inner, inner, 1.8, 1.8, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.55);
  doc.line(x + size * 0.32, y + size * 0.3, x + size * 0.58, y + size * 0.26);
  doc.line(x + size * 0.58, y + size * 0.26, x + size * 0.68, y + size * 0.48);
  doc.line(x + size * 0.68, y + size * 0.48, x + size * 0.48, y + size * 0.58);

  doc.setFillColor(96, 165, 250);
  doc.circle(x + size * 0.5, y + size * 0.72, size * 0.05, "F");
}

function drawReceiptHeader(
  doc: jsPDF,
  pageWidth: number,
  receiptNumber: string,
  paidDate: string
): number {
  const headerH = 38;
  const margin = 20;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, headerH, "F");
  doc.setFillColor(0, 64, 128);
  doc.rect(pageWidth * 0.55, 0, pageWidth * 0.45, headerH, "F");

  const logoSize = 14;
  const logoY = 11;
  drawLogoMark(doc, margin, logoY, logoSize);

  const textX = margin + logoSize + 5;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("SURS", textX, logoY + 5.5);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Smart University Registration System", textX, logoY + 10.5);
  doc.setFontSize(7);
  doc.setTextColor(220, 230, 240);
  doc.text("Universiti Poly-Tech Malaysia (UPTM)", textX, logoY + 15);

  doc.setFontSize(6.5);
  doc.setTextColor(180, 195, 210);
  doc.text("OFFICIAL PAYMENT RECEIPT", pageWidth - margin, logoY + 4, { align: "right" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(receiptNumber, pageWidth - margin, logoY + 10.5, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(200, 215, 230);
  doc.text(formatDateTime(paidDate), pageWidth - margin, logoY + 15.5, { align: "right" });

  return headerH + 10;
}

export function generateReceiptPdf(data: ReceiptData): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const paidDate = data.paidAt ?? data.createdAt;
  const txnRef = stripeRef(data.stripePaymentIntentId);

  let y = drawReceiptHeader(doc, pageWidth, data.receiptNumber, paidDate);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt", margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  const metaX = margin;
  const metaLines = [
    ["Invoice number", data.receiptNumber],
    ["Receipt number", txnRef],
    ["Date paid", formatDateLong(paidDate)],
  ];
  metaLines.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, metaX, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(value, metaX + 38, y);
    doc.setTextColor(...MUTED);
    y += 6;
  });

  y += 8;

  // Issuer | Bill to — two columns
  const col2X = margin + contentWidth / 2 + 4;
  const sectionTop = y;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(ISSUER.name, margin, y);
  doc.text("Bill to", col2X, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(ISSUER.system, margin, y);
  y += 5;
  ISSUER.address.forEach((line) => {
    doc.text(line, margin, y);
    y += 5;
  });
  doc.text(ISSUER.email, margin, y);

  let billY = sectionTop + 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(data.studentName, col2X, billY);
  billY += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  if (data.studentId && data.studentId !== "N/A") {
    doc.text(`Student ID: ${data.studentId}`, col2X, billY);
    billY += 5;
  }
  if (data.programmeName) {
    doc.text(data.programmeName, col2X, billY);
    billY += 5;
  }
  doc.text(`Semester: ${data.semester}`, col2X, billY);
  billY += 5;
  doc.text(data.email, col2X, billY);
  if (data.phone) {
    billY += 5;
    doc.text(data.phone, col2X, billY);
  }

  y = Math.max(y, billY) + 14;

  // Amount paid headline
  doc.setTextColor(...NAVY);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${formatCurrency(data.totalAmount)} paid on ${formatDateLong(paidDate)}`, margin, y);

  y += 12;

  // Line items table
  const colDesc = margin + 2;
  const colQty = margin + contentWidth * 0.55;
  const colUnit = margin + contentWidth * 0.68;
  const colAmt = pageWidth - margin - 2;

  doc.setDrawColor(...BORDER);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 8, "FD");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Description", colDesc, y + 5.5);
  doc.text("Qty", colQty, y + 5.5);
  doc.text("Unit price", colUnit, y + 5.5);
  doc.text("Amount", colAmt, y + 5.5, { align: "right" });

  y += 8;

  const lineItems = [
    {
      desc: data.totalCredits
        ? `Tuition Fee (${data.totalCredits} credits) — ${data.semester}`
        : `Tuition Fee — ${data.semester}`,
      qty: "1",
      unit: data.tuitionAmount,
      amount: data.tuitionAmount,
    },
    {
      desc: "Registration Fee",
      qty: "1",
      unit: data.registrationAmount,
      amount: data.registrationAmount,
    },
    {
      desc: "Resource Fee",
      qty: "1",
      unit: data.resourceAmount,
      amount: data.resourceAmount,
    },
  ];

  lineItems.forEach((item) => {
    doc.setDrawColor(...BORDER);
    doc.line(margin, y, margin + contentWidth, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(item.desc, colDesc, y + 6, { maxWidth: contentWidth * 0.5 });
    doc.text(item.qty, colQty, y + 6);
    doc.text(formatCurrency(item.unit), colUnit, y + 6);
    doc.text(formatCurrency(item.amount), colAmt, y + 6, { align: "right" });
    y += 12;
  });

  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // Summary (right-aligned like Stripe)
  const summaryX = margin + contentWidth * 0.55;
  const summaryValX = pageWidth - margin - 2;

  const summaryRows = [
    ["Subtotal", formatCurrency(data.totalAmount)],
    ["Total", formatCurrency(data.totalAmount)],
    ["Amount paid", formatCurrency(data.totalAmount)],
  ];

  summaryRows.forEach(([label, value], i) => {
    doc.setFontSize(i === 2 ? 10 : 9);
    doc.setFont("helvetica", i >= 1 ? "bold" : "normal");
    if (i === 2) doc.setTextColor(...NAVY);
    else doc.setTextColor(51, 65, 85);
    doc.text(label, summaryX, y);
    doc.text(value, summaryValX, y, { align: "right" });
    y += i === 2 ? 8 : 6;
  });

  y += 10;

  // Payment history
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Payment history", margin, y);
  y += 8;

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setDrawColor(...BORDER);
  doc.rect(margin, y, contentWidth, 8, "S");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  const phMethod = margin + 2;
  const phDate = margin + contentWidth * 0.38;
  const phAmt = margin + contentWidth * 0.62;
  const phReceipt = pageWidth - margin - 2;
  doc.text("Payment method", phMethod, y + 5.5);
  doc.text("Date", phDate, y + 5.5);
  doc.text("Amount paid", phAmt, y + 5.5);
  doc.text("Receipt number", phReceipt, y + 5.5, { align: "right" });

  y += 8;
  doc.setDrawColor(...BORDER);
  doc.line(margin, y, margin + contentWidth, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(data.paymentMethod ?? "Card", phMethod, y + 6);
  doc.text(formatDateLong(paidDate), phDate, y + 6);
  doc.text(formatCurrency(data.totalAmount), phAmt, y + 6);
  doc.text(txnRef, phReceipt, y + 6, { align: "right" });

  y += 16;

  if (data.isTestMode) {
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(8);
    doc.text("Test Mode — This is not a real financial transaction. Payment processed via Stripe.", margin, y);
    y += 6;
  }

  if (data.stripePaymentIntentId) {
    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.text(`Stripe Transaction: ${data.stripePaymentIntentId}`, margin, y);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 16;
  doc.setDrawColor(...BORDER);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
  doc.setTextColor(...MUTED);
  doc.setFontSize(7);
  doc.text(
    "Computer-generated receipt issued by SURS. For enquiries, contact the UPTM Finance Office.",
    margin,
    footerY
  );
  doc.text(`Generated ${formatDateTime(new Date().toISOString())}`, margin, footerY + 4);

  return doc.output("arraybuffer");
}
