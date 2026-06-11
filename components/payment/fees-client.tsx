"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentHistoryList } from "@/components/payment/payment-history-list";
import { formatCurrency } from "@/lib/utils";
import type { FeeBreakdown, Payment } from "@/types/database";
import { CreditCard, Loader2, Receipt, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { TestModeBanner } from "@/components/shared/test-mode-banner";

interface FeesClientProps {
  feeBreakdown: FeeBreakdown | null;
  payments: Payment[];
  hasPendingEnrollments: boolean;
  isTestMode?: boolean;
}

export function FeesClient({
  feeBreakdown,
  payments,
  hasPendingEnrollments,
  isTestMode = true,
}: FeesClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/create-session", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Failed to create payment session");
      }
    } catch {
      setError("Payment service unavailable");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {isTestMode && <TestModeBanner />}
      {feeBreakdown && hasPendingEnrollments && (
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-uptm-blue to-[#004080] px-6 py-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Semester Fee Summary</CardTitle>
                  <p className="text-xs text-white/70">Secure payment via Stripe</p>
                </div>
              </div>
              <ShieldCheck className="hidden h-8 w-8 text-white/30 sm:block" />
            </div>
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2 text-sm">
              {[
                { label: `Tuition (${feeBreakdown.totalCredits} credits)`, amount: feeBreakdown.tuitionAmount },
                { label: "Registration Fee", amount: feeBreakdown.registrationAmount },
                { label: "Resource Fee", amount: feeBreakdown.resourceAmount },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between rounded-lg border border-transparent bg-slate-50 px-4 py-2.5 dark:bg-slate-900/40"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{formatCurrency(row.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between rounded-xl bg-uptm-blue/5 px-4 py-4 text-lg font-bold">
                <span>Total Due</span>
                <span className="text-uptm-blue">{formatCurrency(feeBreakdown.totalAmount)}</span>
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</p>}
            <Button
              className="h-12 w-full text-base shadow-md shadow-uptm-blue/20"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to secure checkout...
                </>
              ) : (
                "Proceed to Secure Payment"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You will receive an official SURS receipt after payment.
            </p>
          </CardContent>
        </Card>
      )}

      {!hasPendingEnrollments && (
        <EmptyState
          icon={Receipt}
          title="No payment due"
          description="You have no pending enrollments requiring payment."
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryList payments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}
