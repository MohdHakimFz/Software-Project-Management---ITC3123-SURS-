import { NextResponse } from "next/server";
import { getStripeWebhookSecret } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentId = session.metadata?.payment_id;
    const studentId = session.metadata?.student_id;

    if (paymentId && studentId) {
      const supabase = await createServiceClient();

      await supabase
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", paymentId);

      await supabase
        .from("enrollments")
        .update({ status: "paid" })
        .eq("student_id", studentId)
        .eq("status", "pending");

      await supabase.from("audit_logs").insert({
        user_id: studentId,
        action: "payment_completed",
        entity_type: "payment",
        entity_id: paymentId,
        details: { amount: session.amount_total },
      });
    }
  }

  return NextResponse.json({ received: true });
}
