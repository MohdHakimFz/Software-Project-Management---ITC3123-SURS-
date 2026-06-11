import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PageBanner } from "@/components/shared/page-banner";
import { StudentDashboardView } from "@/components/student/student-dashboard-view";
import { Button } from "@/components/ui/button";
import { getEnrollmentCountsByCourse, mergeEnrollmentCounts } from "@/lib/enrollment-count";
import { BookOpen, Calendar, CreditCard } from "lucide-react";
import type { Faculty, Programme } from "@/types/database";

export default async function StudentDashboardPage() {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();

  const programme = profile.programmes as (Programme & { faculties?: Faculty }) | undefined;
  const programmeId = profile.programme_id ?? "";

  const [
    { count: enrollmentCount },
    { data: enrollments },
    { data: latestPayment },
    { data: allProgrammeCourses },
    { data: config },
    enrollmentCounts,
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("student_id", profile.id)
      .in("status", ["pending", "paid", "confirmed"]),
    supabase
      .from("enrollments")
      .select("*, courses(code, name, credit_hours, lecturer)")
      .eq("student_id", profile.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("payments")
      .select("*")
      .eq("student_id", profile.id)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    programmeId
      ? supabase
          .from("courses")
          .select("id, code, name, credit_hours, lecturer, capacity, enrolled_count")
          .eq("is_active", true)
          .eq("programme_id", programmeId)
          .order("code")
      : Promise.resolve({ data: [] }),
    supabase.from("system_config").select("key, value"),
    getEnrollmentCountsByCourse(supabase),
  ]);

  const coursesWithCounts = mergeEnrollmentCounts(allProgrammeCourses ?? [], enrollmentCounts);

  const activeEnrollments =
    enrollments?.filter((e) => ["pending", "paid", "confirmed"].includes(e.status)) ?? [];
  const pendingEnrollments = activeEnrollments.filter((e) => e.status === "pending");
  const enrolledCourseIds = new Set(activeEnrollments.map((e) => e.course_id));

  const browseCourses = coursesWithCounts
    .filter((c) => !enrolledCourseIds.has(c.id))
    .slice(0, 4);

  const totalCredits = activeEnrollments.reduce(
    (sum, e) => sum + ((e.courses as { credit_hours?: number })?.credit_hours ?? 0),
    0
  );

  const timetableCourseIds = activeEnrollments.map((e) => e.course_id);

  let timetableSlots: Awaited<ReturnType<typeof fetchTimetable>> = [];
  if (timetableCourseIds.length > 0) {
    timetableSlots = await fetchTimetable(supabase, timetableCourseIds);
  }

  const calendar = config?.find((c) => c.key === "academic_calendar")?.value as {
    semester?: string;
    registration_open?: boolean;
  } | undefined;

  const programmeName = programme?.name ?? "No programme assigned";
  const firstName = profile.full_name.split(" ")[0];

  return (
    <DashboardLayout profile={profile}>
      <PageBanner
        badge={calendar?.semester ?? "Semester 2026/1"}
        title={`Welcome back, ${firstName}!`}
        subtitle={`${profile.student_id ? `ID: ${profile.student_id}` : "Student"}${programme?.code ? ` · ${programme.code}` : ""} · ${programmeName}`}
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <Link href="/student/courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <Link href="/student/timetable">
              <Calendar className="mr-2 h-4 w-4" />
              Timetable
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <Link href="/student/fees">
              <CreditCard className="mr-2 h-4 w-4" />
              Fees
            </Link>
          </Button>
        </div>
      </PageBanner>

      <StudentDashboardView
        programme={programme}
        programmeId={programmeId}
        semester={calendar?.semester ?? "2026/1"}
        registrationOpen={calendar?.registration_open !== false}
        enrollmentCount={enrollmentCount ?? 0}
        pendingCount={pendingEnrollments.length}
        openCourseCount={coursesWithCounts.filter((c) => !enrolledCourseIds.has(c.id)).length}
        totalCredits={totalCredits}
        activeEnrollments={activeEnrollments}
        browseCourses={browseCourses}
        latestPayment={latestPayment}
        timetableSlots={timetableSlots}
      />
    </DashboardLayout>
  );
}

async function fetchTimetable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseIds: string[]
) {
  const { data } = await supabase
    .from("timetables")
    .select("*, courses(code, name)")
    .in("course_id", courseIds)
    .order("day_of_week")
    .order("start_time");
  return data ?? [];
}
