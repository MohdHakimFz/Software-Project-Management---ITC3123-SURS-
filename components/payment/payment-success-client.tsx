"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReceiptDocument } from "@/components/payment/receipt-document";
import type { ReceiptData } from "@/lib/receipt-pdf";
import { Button } from "@/components/ui/button";
import { TestModeBanner } from "@/components/shared/test-mode-banner";
import { CheckCircle2, Loader2, ArrowRight, LayoutDashboard } from "lucide-react";

interface PaymentSuccessClientProps {
  sessionId: string;
  initialReceipt: ReceiptData | null;
  initialPaymentId: string | null;
  initialStatus: string;
  isTestMode?: boolean;
}

export function PaymentSuccessClient({
  sessionId,
  initialReceipt,
  initialPaymentId,
  initialStatus,
  isTestMode = true,
}: PaymentSuccessClientProps) {
  const [status, setStatus] = useState(initialStatus);
  const [receipt, setReceipt] = useState<ReceiptData | null>(initialReceipt);
  const [paymentId, setPaymentId] = useState<string | null>(initialPaymentId);
  const [polling, setPolling] = useState(initialStatus !== "paid");

  useEffect(() => {
    if (status === "paid") return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      if (attempts > 15) {
        clearInterval(interval);
        setPolling(false);
        return;
      }

      try {
        const res = await fetch(`/api/payment/status?session_id=${sessionId}`);
        const data = await res.json();
        if (data.status === "paid" && data.receipt) {
          setStatus("paid");
          setReceipt(data.receipt);
          setPaymentId(data.paymentId);
          setPolling(false);
          clearInterval(interval);
        }
      } catch {
        // keep polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, status]);

  if (status !== "paid" && polling) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-uptm-blue" />
        <h2 className="mt-4 text-lg font-semibold">Confirming your payment...</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Please wait while we verify your transaction with Stripe.
        </p>
      </div>
    );
  }

  if (status !== "paid" || !receipt || !paymentId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900 dark:bg-amber-950/30">
        <p className="font-medium text-amber-800 dark:text-amber-200">Payment received — receipt pending</p>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          Your payment may still be processing. Check Payment History in a few moments.
        </p>
        <Button asChild className="mt-4">
          <Link href="/student/fees">Go to Fees & Payment</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTestMode && <TestModeBanner compact showCardHint={false} />}
      <div className="animate-fade-in-up rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 print:hidden dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-card">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Payment Successful</h2>
            <p className="mt-1 text-muted-foreground">
              Your semester fees have been paid and your enrollments are now confirmed.
            </p>
            <p className="mt-2 font-mono text-sm text-uptm-blue">{receipt.receiptNumber}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/student/enrollment">
              View Enrollments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/student/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <ReceiptDocument data={receipt} paymentId={paymentId} />
    </div>
  );
}
