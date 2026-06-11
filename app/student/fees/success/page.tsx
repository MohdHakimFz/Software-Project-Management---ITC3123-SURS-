import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PaymentSuccessClient } from "@/components/payment/payment-success-client";
import { getPaymentCredits, PAYMENT_RECEIPT_SELECT, toReceiptData } from "@/lib/payment-receipt";
import { isStripeTestMode } from "@/lib/env";
import { Button } from "@/components/ui/button";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const profile = await requireRole(["student"]);
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <DashboardLayout profile={profile} title="Payment">
        <div className="rounded-2xl border p-8 text-center">
          <p className="text-muted-foreground">Invalid payment session.</p>
          <Button asChild className="mt-4">
            <Link href="/student/fees">Back to Fees</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const supabase = await createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select(PAYMENT_RECEIPT_SELECT)
    .eq("stripe_session_id", sessionId)
    .eq("student_id", profile.id)
    .single();

  const totalCredits =
    payment?.status === "paid"
      ? await getPaymentCredits(supabase, profile.id, payment.semester)
      : undefined;
  const receipt =
    payment?.status === "paid" ? toReceiptData(payment, { totalCredits }) : null;

  return (
    <DashboardLayout profile={profile} title="Payment Confirmation">
      <PaymentSuccessClient
        sessionId={sessionId}
        initialReceipt={receipt}
        initialPaymentId={payment?.id ?? null}
        initialStatus={payment?.status ?? "pending"}
        isTestMode={isStripeTestMode()}
      />
    </DashboardLayout>
  );
}
