import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReceiptHtml } from "@/lib/receipt-html";
import { getPaymentCredits, PAYMENT_RECEIPT_SELECT, toReceiptData } from "@/lib/payment-receipt";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const paymentId = new URL(request.url).searchParams.get("id");
  if (!paymentId) return NextResponse.json({ error: "Payment ID required" }, { status: 400 });

  const autoPrint = new URL(request.url).searchParams.get("print") !== "false";

  const { data: payment } = await supabase
    .from("payments")
    .select(PAYMENT_RECEIPT_SELECT)
    .eq("id", paymentId)
    .eq("student_id", user.id)
    .single();

  if (!payment || payment.status !== "paid") {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  const totalCredits = await getPaymentCredits(supabase, user.id, payment.semester);
  const html = generateReceiptHtml(toReceiptData(payment, { totalCredits }), autoPrint);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
