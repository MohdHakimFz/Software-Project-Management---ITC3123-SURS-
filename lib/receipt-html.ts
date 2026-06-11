import type { ReceiptData } from "@/lib/receipt-pdf";
import { formatCurrency, formatDateLong, formatDateTime } from "@/lib/utils";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripeRef(id: string | null | undefined): string {
  if (!id) return "—";
  return id.replace(/^pi_/, "").slice(-12).toUpperCase();
}

const LOGO_SVG = `<svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="10" fill="#003366"/>
  <path d="M30 14C30 14 26 12 20 14C14 16 14 20 18 22C22 24 28 23 28 26C28 29 24 31 18 29" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <circle cx="24" cy="34" r="2" fill="#60A5FA"/>
</svg>`;

export function generateReceiptHtml(data: ReceiptData, autoPrint = true): string {
  const paidDate = data.paidAt ?? data.createdAt;
  const txnRef = stripeRef(data.stripePaymentIntentId);
  const tuitionDesc = data.totalCredits
    ? `Tuition Fee (${data.totalCredits} credits) — ${esc(data.semester)}`
    : `Tuition Fee — ${esc(data.semester)}`;

  const lineItems = [
    { desc: tuitionDesc, qty: 1, unit: data.tuitionAmount, amount: data.tuitionAmount },
    { desc: "Registration Fee", qty: 1, unit: data.registrationAmount, amount: data.registrationAmount },
    { desc: "Resource Fee", qty: 1, unit: data.resourceAmount, amount: data.resourceAmount },
  ];

  const rows = lineItems
    .map(
      (item) => `
      <tr>
        <td>${item.desc}</td>
        <td class="center">${item.qty}</td>
        <td class="right">${esc(formatCurrency(item.unit))}</td>
        <td class="right bold">${esc(formatCurrency(item.amount))}</td>
      </tr>`
    )
    .join("");

  const printScript = autoPrint
    ? `<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},400)});</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt ${esc(data.receiptNumber)}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      background: #fff;
      color: #1e293b;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 0 16mm 14mm 16mm;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      background: linear-gradient(90deg, #003366 0%, #004080 100%);
      color: #fff;
      padding: 16px 16mm;
      margin: 0 -16mm 16px -16mm;
      width: calc(100% + 32mm);
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-box {
      background: #fff;
      border-radius: 10px;
      padding: 4px;
      line-height: 0;
      flex-shrink: 0;
    }
    .brand h1 { margin: 0; font-size: 18pt; font-weight: 700; letter-spacing: 0.02em; }
    .brand p { margin: 2px 0 0; font-size: 8.5pt; opacity: 0.9; }
    .brand .sub { opacity: 0.65; font-size: 7.5pt; }
    .meta { text-align: right; flex-shrink: 0; }
    .meta .label {
      font-size: 7pt;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      opacity: 0.6;
      margin: 0 0 4px;
    }
    .meta .ref { margin: 0; font-size: 11pt; font-weight: 700; font-family: Consolas, monospace; }
    .meta .date { margin: 4px 0 0; font-size: 8pt; opacity: 0.75; }
    .body { padding: 2mm 0 0; }
    .title { margin: 0 0 12px; font-size: 20pt; font-weight: 700; }
    .kv { margin: 0 0 4px; font-size: 9.5pt; }
    .kv dt { display: inline-block; width: 105px; color: #64748b; }
    .kv dd { display: inline; margin: 0; font-weight: 600; }
    .cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 14px 0;
      font-size: 9.5pt;
      color: #475569;
    }
    .cols h3 { margin: 0 0 6px; color: #0f172a; font-size: 10pt; }
    .cols p { margin: 0 0 3px; }
    .paid-line {
      margin: 14px 0 12px;
      font-size: 13pt;
      font-weight: 700;
      color: #003366;
    }
    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin: 0 0 8px;
    }
    col.col-desc { width: 48%; }
    col.col-qty { width: 10%; }
    col.col-unit { width: 21%; }
    col.col-amt { width: 21%; }
    th {
      text-align: left;
      background: #f8fafc;
      color: #475569;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 7px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 600; color: #0f172a; }
    .summary {
      width: 42%;
      margin-left: auto;
      font-size: 9.5pt;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 0 0 4px;
      color: #475569;
    }
    .summary-row.total {
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 6px;
      font-size: 11pt;
      font-weight: 700;
      color: #003366;
    }
    .section-title { margin: 14px 0 8px; font-size: 11pt; font-weight: 700; }
    .test-mode { margin: 10px 0 0; font-size: 8pt; color: #b45309; }
    .stripe-ref { margin: 4px 0 0; font-size: 7pt; color: #94a3b8; font-family: Consolas, monospace; }
    .footer {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 7.5pt;
      color: #94a3b8;
    }
    @media screen {
      html, body { width: auto; }
      body { background: #e2e8f0; padding: 20px; }
      .page {
        background: #fff;
        box-shadow: 0 8px 30px rgb(0 0 0 / 12%);
      }
    }
    @media print {
      html, body {
        width: 210mm !important;
        background: #fff !important;
      }
      .page {
        width: 210mm !important;
        min-height: auto !important;
        box-shadow: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="logo-box">${LOGO_SVG}</div>
        <div>
          <h1>SURS</h1>
          <p>Smart University Registration System</p>
          <p class="sub">Universiti Poly-Tech Malaysia (UPTM)</p>
        </div>
      </div>
      <div class="meta">
        <p class="label">Official Payment Receipt</p>
        <p class="ref">${esc(data.receiptNumber)}</p>
        <p class="date">${esc(formatDateTime(paidDate))}</p>
      </div>
    </div>

    <div class="body">
      <h2 class="title">Receipt</h2>
      <dl>
        <div class="kv"><dt>Invoice number</dt><dd>${esc(data.receiptNumber)}</dd></div>
        <div class="kv"><dt>Receipt number</dt><dd>${esc(txnRef)}</dd></div>
        <div class="kv"><dt>Date paid</dt><dd>${esc(formatDateLong(paidDate))}</dd></div>
      </dl>

      <div class="cols">
        <div>
          <h3>Universiti Poly-Tech Malaysia (UPTM)</h3>
          <p>Smart University Registration System (SURS)</p>
          <p>Jalan 6/91, Taman Shamelin Perkasa</p>
          <p>56100 Kuala Lumpur, Malaysia</p>
          <p>finance@uptm.edu.my</p>
        </div>
        <div>
          <h3>Bill to</h3>
          <p><strong>${esc(data.studentName)}</strong></p>
          ${data.studentId && data.studentId !== "N/A" ? `<p>Student ID: ${esc(data.studentId)}</p>` : ""}
          ${data.programmeName ? `<p>${esc(data.programmeName)}</p>` : ""}
          <p>Semester: ${esc(data.semester)}</p>
          <p>${esc(data.email)}</p>
          ${data.phone ? `<p>${esc(data.phone)}</p>` : ""}
        </div>
      </div>

      <p class="paid-line">${esc(formatCurrency(data.totalAmount))} paid on ${esc(formatDateLong(paidDate))}</p>

      <table>
        <colgroup>
          <col class="col-desc" />
          <col class="col-qty" />
          <col class="col-unit" />
          <col class="col-amt" />
        </colgroup>
        <thead>
          <tr>
            <th>Description</th>
            <th class="center">Qty</th>
            <th class="right">Unit price</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="summary">
        <div class="summary-row"><span>Subtotal</span><span>${esc(formatCurrency(data.totalAmount))}</span></div>
        <div class="summary-row"><span>Total</span><span>${esc(formatCurrency(data.totalAmount))}</span></div>
        <div class="summary-row total"><span>Amount paid</span><span>${esc(formatCurrency(data.totalAmount))}</span></div>
      </div>

      <h3 class="section-title">Payment history</h3>
      <table>
        <colgroup>
          <col class="col-desc" />
          <col class="col-unit" />
          <col class="col-unit" />
          <col class="col-amt" />
        </colgroup>
        <thead>
          <tr>
            <th>Payment method</th>
            <th>Date</th>
            <th class="right">Amount paid</th>
            <th class="right">Receipt number</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${esc(data.paymentMethod ?? "Card")}</td>
            <td>${esc(formatDateLong(paidDate))}</td>
            <td class="right bold">${esc(formatCurrency(data.totalAmount))}</td>
            <td class="right" style="font-family:Consolas,monospace;font-size:8pt">${esc(txnRef)}</td>
          </tr>
        </tbody>
      </table>

      ${data.isTestMode ? `<p class="test-mode">Test Mode — This is not a real financial transaction. Payment processed via Stripe.</p>` : ""}
      ${data.stripePaymentIntentId ? `<p class="stripe-ref">Stripe Transaction: ${esc(data.stripePaymentIntentId)}</p>` : ""}

      <p class="footer">Computer-generated receipt issued by SURS · UPTM Finance Office</p>
    </div>
  </div>
  ${printScript}
</body>
</html>`;
}
