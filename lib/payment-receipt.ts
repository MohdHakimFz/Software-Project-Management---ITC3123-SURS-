import type { ReceiptData } from "@/lib/receipt-pdf";
import { isStripeTestMode } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";

const PAYMENT_PROFILE_SELECT = "full_name, student_id, email, phone, programmes(name)";
export const PAYMENT_RECEIPT_SELECT = `*, profiles(${PAYMENT_PROFILE_SELECT})`;

export async function getPaymentCredits(
  supabase: SupabaseClient,
  studentId: string,
  semester: string
): Promise<number | undefined> {
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("courses(credit_hours)")
    .eq("student_id", studentId)
    .eq("semester", semester)
    .in("status", ["paid", "confirmed"]);

  if (!enrollments?.length) return undefined;

  return enrollments.reduce((sum, row) => {
    const course = row.courses as { credit_hours?: number } | null;
    return sum + (course?.credit_hours ?? 0);
  }, 0);
}

interface PaymentWithProfile {
  receipt_number: string | null;
  paid_at: string | null;
  created_at: string;
  semester: string;
  tuition_amount: number;
  registration_amount: number;
  resource_amount: number;
  amount: number;
  stripe_payment_intent_id: string | null;
  stripe_session_id?: string | null;
  profiles?: {
    full_name?: string;
    student_id?: string | null;
    email?: string;
    phone?: string | null;
    programmes?: { name?: string } | null;
  } | null;
}

export function toReceiptData(
  payment: PaymentWithProfile,
  options?: { totalCredits?: number }
): ReceiptData {
  const profile = payment.profiles;
  const isTestMode = isStripeTestMode();
  return {
    receiptNumber: payment.receipt_number ?? "N/A",
    paidAt: payment.paid_at,
    createdAt: payment.created_at,
    semester: payment.semester,
    studentName: profile?.full_name ?? "Student",
    studentId: profile?.student_id ?? "N/A",
    email: profile?.email ?? "",
    phone: profile?.phone,
    programmeName: profile?.programmes?.name,
    tuitionAmount: Number(payment.tuition_amount),
    registrationAmount: Number(payment.registration_amount),
    resourceAmount: Number(payment.resource_amount),
    totalAmount: Number(payment.amount),
    totalCredits: options?.totalCredits,
    stripePaymentIntentId: payment.stripe_payment_intent_id,
    stripeSessionId: payment.stripe_session_id,
    paymentMethod: "Card",
    isTestMode,
  };
}
