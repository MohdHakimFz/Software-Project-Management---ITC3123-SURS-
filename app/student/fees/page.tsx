import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { FeesClient } from "@/components/payment/fees-client";
import { calculateFees } from "@/lib/fees";
import { parseAcademicCalendar } from "@/lib/academic-calendar";
import { isStripeTestMode } from "@/lib/env";

export default async function StudentFeesPage({
  searchParams,
}: {
  searchParams: { cancelled?: string };
}) {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();

  const [{ data: pendingEnrollments }, { data: payments }, { data: config }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, courses(*)")
      .eq("student_id", profile.id)
      .eq("status", "pending"),
    supabase
      .from("payments")
      .select("*")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("system_config").select("key, value"),
  ]);

  const currentSemester = parseAcademicCalendar(config ?? []).semester;

  const { data: feeStructure } = await supabase
    .from("fee_structures")
    .select("*")
    .eq("programme_id", profile.programme_id ?? "")
    .eq("is_active", true)
    .eq("semester", currentSemester)
    .maybeSingle();

  const courses = pendingEnrollments?.map((e) => e.courses).filter(Boolean) ?? [];
  const feeBreakdown =
    feeStructure && courses.length > 0
      ? calculateFees(courses as Parameters<typeof calculateFees>[0], feeStructure)
      : null;

  return (
    <DashboardLayout profile={profile} title="Fees & Payment">
      {searchParams.cancelled && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
          Payment was cancelled. You can try again when ready.
        </div>
      )}
      <FeesClient
        feeBreakdown={feeBreakdown}
        payments={payments ?? []}
        hasPendingEnrollments={(pendingEnrollments?.length ?? 0) > 0}
        isTestMode={isStripeTestMode()}
      />
    </DashboardLayout>
  );
}
