import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReceiptPdf } from "@/lib/receipt-pdf";
import { getPaymentCredits, PAYMENT_RECEIPT_SELECT, toReceiptData } from "@/lib/payment-receipt";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("id");
  if (!paymentId) return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
  const inline = searchParams.get("inline") === "1";

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
  const receiptData = toReceiptData(payment, { totalCredits });
  const pdfBuffer = generateReceiptPdf(receiptData);

  const filename = `SURS-Receipt-${payment.receipt_number}.pdf`;
  const disposition = inline ? "inline" : "attachment";

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
    },
  });
}
