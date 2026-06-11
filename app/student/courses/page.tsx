import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { CoursesClient } from "@/components/enrollment/courses-client";
import { getEnrollmentCountsByCourse, mergeEnrollmentCounts } from "@/lib/enrollment-count";
import { parseAcademicCalendar } from "@/lib/academic-calendar";
import type { Faculty, Programme } from "@/types/database";

export default async function StudentCoursesPage() {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();
  const programme = profile.programmes as (Programme & { faculties?: Faculty }) | undefined;

  const [{ data: courses }, { data: enrollments }, enrollmentCounts, { data: config }] =
    await Promise.all([
      supabase
        .from("courses")
        .select("*, programmes(*), timetables(*)")
        .eq("is_active", true)
        .eq("programme_id", profile.programme_id ?? "")
        .order("code"),
      supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", profile.id),
      getEnrollmentCountsByCourse(supabase),
      supabase.from("system_config").select("key, value"),
    ]);

  const currentSemester = parseAcademicCalendar(config ?? []).semester;

  const { data: feeStructure } = profile.programme_id
    ? await supabase
        .from("fee_structures")
        .select("tuition_per_credit, registration_fee, resource_fee, semester")
        .eq("programme_id", profile.programme_id)
        .eq("is_active", true)
        .eq("semester", currentSemester)
        .maybeSingle()
    : { data: null };

  const coursesWithCounts = mergeEnrollmentCounts(courses ?? [], enrollmentCounts);

  return (
    <DashboardLayout profile={profile} title="Browse Courses">
      <CoursesClient
        courses={coursesWithCounts}
        enrollments={enrollments ?? []}
        studentId={profile.id}
        programmeCode={programme?.code}
        programmeName={programme?.name}
        tuitionPerCredit={feeStructure ? Number(feeStructure.tuition_per_credit) : undefined}
      />
    </DashboardLayout>
  );
}
