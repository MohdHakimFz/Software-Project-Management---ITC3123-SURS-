import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Payment } from "@/types/database";
import { Download, Eye, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentHistoryListProps {
  payments: Payment[];
}

export function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Receipt className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">No payment history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => {
        const isPaid = payment.status === "paid";
        const displayDate = payment.paid_at ?? payment.created_at;

        return (
          <div
            key={payment.id}
            className="group flex flex-col gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <div
                className={`rounded-xl p-2.5 ${isPaid ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}
              >
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{formatCurrency(Number(payment.amount))}</p>
                  <StatusBadge status={payment.status} />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {payment.receipt_number && (
                    <span className="font-mono text-xs">{payment.receipt_number}</span>
                  )}
                  {payment.receipt_number && " · "}
                  {formatDateTime(displayDate)}
                </p>
                <p className="text-xs text-muted-foreground">Semester: {payment.semester}</p>
              </div>
            </div>

            {isPaid && payment.receipt_number && (
              <div className="flex gap-2 sm:shrink-0">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/student/fees/receipt/${payment.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-uptm-blue hover:bg-uptm-blue/90">
                  <a href={`/api/payment/receipt?id=${payment.id}`}>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </a>
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
