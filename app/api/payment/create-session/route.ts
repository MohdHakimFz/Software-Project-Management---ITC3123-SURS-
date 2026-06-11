import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { calculateFees } from "@/lib/fees";
import { parseAcademicCalendar } from "@/lib/academic-calendar";
import { generateReceiptNumber } from "@/lib/utils";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, programmes(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.programme_id) {
    return NextResponse.json({ error: "No programme assigned" }, { status: 400 });
  }

  const { data: pendingEnrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("student_id", user.id)
    .eq("status", "pending");

  if (!pendingEnrollments?.length) {
    return NextResponse.json({ error: "No pending enrollments" }, { status: 400 });
  }

  const { data: config } = await supabase.from("system_config").select("key, value");
  const currentSemester = parseAcademicCalendar(config ?? []).semester;

  const { data: feeStructure } = await supabase
    .from("fee_structures")
    .select("*")
    .eq("programme_id", profile.programme_id)
    .eq("is_active", true)
    .eq("semester", currentSemester)
    .maybeSingle();

  if (!feeStructure) {
    return NextResponse.json({ error: "Fee structure not found" }, { status: 400 });
  }

  const courses = pendingEnrollments.map((e) => e.courses).filter(Boolean);
  const fees = calculateFees(courses as Parameters<typeof calculateFees>[0], feeStructure);

  const receiptNumber = generateReceiptNumber();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      student_id: user.id,
      amount: fees.totalAmount,
      tuition_amount: fees.tuitionAmount,
      registration_amount: fees.registrationAmount,
      resource_amount: fees.resourceAmount,
      status: "pending",
      semester: feeStructure.semester,
      receipt_number: receiptNumber,
    })
    .select()
    .single();

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const programmeName = (profile.programmes as { name?: string } | null)?.name;
    const semesterLabel = feeStructure.semester;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: profile.email,
      phone_number_collection: { enabled: false },
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: `Tuition Fee (${fees.totalCredits} credits)`,
              description: `${semesterLabel}${programmeName ? ` · ${programmeName}` : ""}`,
            },
            unit_amount: Math.round(fees.tuitionAmount * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "myr",
            product_data: { name: "Registration Fee" },
            unit_amount: Math.round(fees.registrationAmount * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "myr",
            product_data: { name: "Resource Fee" },
            unit_amount: Math.round(fees.resourceAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      custom_text: {
        submit: {
          message: "Your payment is processed securely by Stripe on behalf of UPTM SURS.",
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/student/fees/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/student/fees?cancelled=true`,
      metadata: {
        payment_id: payment.id,
        student_id: user.id,
        receipt_number: receiptNumber,
      },
    });

    await supabase
      .from("payments")
      .update({ stripe_session_id: session.id })
      .eq("id", payment.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
