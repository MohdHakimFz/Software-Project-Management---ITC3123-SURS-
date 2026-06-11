import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { EnrollmentList } from "@/components/enrollment/enrollment-list";

export default async function StudentEnrollmentPage() {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("student_id", profile.id)
    .neq("status", "cancelled")
    .order("enrolled_at", { ascending: false });

  const pending = enrollments?.filter((e) => e.status === "pending") ?? [];
  const confirmed = enrollments?.filter((e) => ["paid", "confirmed"].includes(e.status)) ?? [];

  return (
    <DashboardLayout profile={profile} title="My Enrollment">
      <EnrollmentList pending={pending} confirmed={confirmed} />
    </DashboardLayout>
  );
}
