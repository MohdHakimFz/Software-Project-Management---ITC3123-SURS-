import { formatCurrency, formatDateLong } from "@/lib/utils";
import type { ReceiptData } from "@/lib/receipt-pdf";
import { ReceiptActions } from "@/components/payment/receipt-actions";
import { ReceiptHeader } from "@/components/payment/receipt-header";

const ISSUER = {
  name: "Universiti Poly-Tech Malaysia (UPTM)",
  system: "Smart University Registration System (SURS)",
  address: ["Jalan 6/91, Taman Shamelin Perkasa", "56100 Kuala Lumpur, Malaysia"],
  email: "finance@uptm.edu.my",
} as const;

function stripeRef(id: string | null | undefined): string {
  if (!id) return "—";
  return id.replace(/^pi_/, "").slice(-12).toUpperCase();
}

interface ReceiptDocumentProps {
  data: ReceiptData;
  paymentId?: string;
}

export function ReceiptDocument({ data, paymentId }: ReceiptDocumentProps) {
  const paidDate = data.paidAt ?? data.createdAt;
  const txnRef = stripeRef(data.stripePaymentIntentId);

  const lineItems = [
    {
      desc: data.totalCredits
        ? `Tuition Fee (${data.totalCredits} credits) — ${data.semester}`
        : `Tuition Fee — ${data.semester}`,
      qty: 1,
      unit: data.tuitionAmount,
      amount: data.tuitionAmount,
    },
    { desc: "Registration Fee", qty: 1, unit: data.registrationAmount, amount: data.registrationAmount },
    { desc: "Resource Fee", qty: 1, unit: data.resourceAmount, amount: data.resourceAmount },
  ];

  return (
    <div className="receipt-document w-full overflow-hidden bg-white text-slate-900 dark:bg-white dark:text-slate-900">
      <ReceiptHeader receiptNumber={data.receiptNumber} paidAt={paidDate} />

      <div className="receipt-document-body p-8 sm:p-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Receipt</h1>

        <dl className="mt-4 space-y-1.5 text-sm">
          {[
            ["Invoice number", data.receiptNumber],
            ["Receipt number", txnRef],
            ["Date paid", formatDateLong(paidDate)],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-8">
              <dt className="w-28 shrink-0 text-slate-500">{label}</dt>
              <dd className="font-semibold text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="receipt-bill-grid mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div className="text-sm leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-900">{ISSUER.name}</p>
            <p>{ISSUER.system}</p>
            {ISSUER.address.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>{ISSUER.email}</p>
          </div>
          <div className="text-sm leading-relaxed text-slate-600">
            <p className="mb-2 font-semibold text-slate-900">Bill to</p>
            <p className="font-semibold text-slate-900">{data.studentName}</p>
            {data.studentId && data.studentId !== "N/A" && <p>Student ID: {data.studentId}</p>}
            {data.programmeName && <p>{data.programmeName}</p>}
            <p>Semester: {data.semester}</p>
            <p>{data.email}</p>
            {data.phone && <p>{data.phone}</p>}
          </div>
        </div>

        <p className="mt-10 text-xl font-bold text-uptm-blue">
          {formatCurrency(data.totalAmount)} paid on {formatDateLong(paidDate)}
        </p>

        <div className="receipt-table-wrap mt-8 w-full overflow-x-auto">
          <table className="receipt-table w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-3 py-3">Description</th>
                <th className="w-16 px-3 py-3 text-center">Qty</th>
                <th className="w-28 px-3 py-3 text-right">Unit price</th>
                <th className="w-28 px-3 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.desc} className="border-b border-slate-100">
                  <td className="px-3 py-4 text-slate-700">{item.desc}</td>
                  <td className="px-3 py-4 text-center text-slate-600">{item.qty}</td>
                  <td className="px-3 py-4 text-right text-slate-600">{formatCurrency(item.unit)}</td>
                  <td className="px-3 py-4 text-right font-medium text-slate-800">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-summary mt-4 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm sm:w-72">
            {[
              ["Subtotal", formatCurrency(data.totalAmount)],
              ["Total", formatCurrency(data.totalAmount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-slate-600">
                <dt>{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-uptm-blue">
              <dt>Amount paid</dt>
              <dd>{formatCurrency(data.totalAmount)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-10">
          <h2 className="text-base font-bold text-slate-900">Payment history</h2>
          <div className="receipt-table-wrap mt-3 w-full overflow-x-auto">
            <table className="receipt-table w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-3 py-3">Payment method</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3 text-right">Amount paid</th>
                  <th className="px-3 py-3 text-right">Receipt number</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-4 text-slate-700">{data.paymentMethod ?? "Card"}</td>
                  <td className="px-3 py-4 text-slate-600">{formatDateLong(paidDate)}</td>
                  <td className="px-3 py-4 text-right font-medium text-slate-800">
                    {formatCurrency(data.totalAmount)}
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-xs text-slate-600">{txnRef}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {data.isTestMode && (
          <p className="mt-6 text-xs font-medium text-amber-700">
            Test Mode — This is not a real financial transaction. Payment processed via Stripe.
          </p>
        )}

        {data.stripePaymentIntentId && (
          <p className="mt-2 font-mono text-[10px] text-slate-400">
            Stripe Transaction: {data.stripePaymentIntentId}
          </p>
        )}

        {paymentId && <ReceiptActions paymentId={paymentId} />}

        <p className="mt-8 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-400">
          Computer-generated receipt issued by SURS · UPTM Finance Office
        </p>
      </div>
    </div>
  );
}
