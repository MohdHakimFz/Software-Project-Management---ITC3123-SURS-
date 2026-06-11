import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentCredits, PAYMENT_RECEIPT_SELECT, toReceiptData } from "@/lib/payment-receipt";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select(PAYMENT_RECEIPT_SELECT)
    .eq("stripe_session_id", sessionId)
    .eq("student_id", user.id)
    .single();

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const totalCredits =
    payment.status === "paid"
      ? await getPaymentCredits(supabase, user.id, payment.semester)
      : undefined;

  return NextResponse.json({
    status: payment.status,
    paymentId: payment.id,
    receipt:
      payment.status === "paid" ? toReceiptData(payment, { totalCredits }) : null,
  });
}
