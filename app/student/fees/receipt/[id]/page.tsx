import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ReceiptDocument } from "@/components/payment/receipt-document";
import { getPaymentCredits, PAYMENT_RECEIPT_SELECT, toReceiptData } from "@/lib/payment-receipt";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ReceiptViewPage({ params }: { params: { id: string } }) {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select(PAYMENT_RECEIPT_SELECT)
    .eq("id", params.id)
    .eq("student_id", profile.id)
    .single();

  if (!payment || payment.status !== "paid") {
    notFound();
  }

  const totalCredits = await getPaymentCredits(supabase, profile.id, payment.semester);

  return (
    <DashboardLayout profile={profile} title="Payment Receipt">
      <div className="mb-6 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/fees">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fees
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-[210mm] rounded-xl border bg-white shadow-lg">
        <ReceiptDocument data={toReceiptData(payment, { totalCredits })} paymentId={payment.id} />
      </div>
    </DashboardLayout>
  );
}
