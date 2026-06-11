import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PageBanner } from "@/components/shared/page-banner";
import { StaffDashboardView } from "@/components/staff/staff-dashboard-view";
import { Button } from "@/components/ui/button";
import { getEnrollmentCountsByCourse, mergeEnrollmentCounts } from "@/lib/enrollment-count";
import { normalizeEnrollmentRow } from "@/lib/normalize-relations";
import { Users, BookOpen } from "lucide-react";

export default async function StaffDashboardPage() {
  const profile = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const [
    { count: studentCount },
    { count: courseCount },
    { count: pendingCount },
    { count: confirmedCount },
    { data: enrollments },
    { data: recentEnrollments },
    { data: activeCourses },
    { data: config },
    enrollmentCounts,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).in("status", ["paid", "confirmed"]),
    supabase.from("enrollments").select("status"),
    supabase
      .from("enrollments")
      .select("id, status, enrolled_at, profiles(full_name, student_id), courses(code, name)")
      .order("enrolled_at", { ascending: false })
      .limit(8),
    supabase
      .from("courses")
      .select("id, code, name, capacity, enrolled_count, lecturer")
      .eq("is_active", true)
      .order("code"),
    supabase.from("system_config").select("key, value"),
    getEnrollmentCountsByCourse(supabase),
  ]);

  const enrollmentStats = {
    pending: enrollments?.filter((e) => e.status === "pending").length ?? 0,
    paid: enrollments?.filter((e) => e.status === "paid").length ?? 0,
    confirmed: enrollments?.filter((e) => e.status === "confirmed").length ?? 0,
    cancelled: enrollments?.filter((e) => e.status === "cancelled").length ?? 0,
  };

  const coursesWithCounts = mergeEnrollmentCounts(activeCourses ?? [], enrollmentCounts);
  const topCourses = [...coursesWithCounts]
    .sort((a, b) => b.enrolled_count - a.enrolled_count)
    .slice(0, 5);

  const calendar = config?.find((c) => c.key === "academic_calendar")?.value as {
    semester?: string;
    registration_open?: boolean;
  } | undefined;

  const firstName = profile.full_name.split(" ")[0];

  return (
    <DashboardLayout profile={profile} title="Staff Dashboard">
      <PageBanner
        badge={calendar?.semester ?? "Registrar Portal"}
        title={`Welcome, ${firstName}`}
        subtitle="Manage student registrations, courses, and enrollment requests."
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <Link href="/staff/students">
              <Users className="mr-2 h-4 w-4" />
              Students
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <Link href="/staff/courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </Link>
          </Button>
        </div>
      </PageBanner>

      <StaffDashboardView
        studentCount={studentCount ?? 0}
        courseCount={courseCount ?? 0}
        pendingCount={pendingCount ?? 0}
        confirmedCount={confirmedCount ?? 0}
        enrollmentStats={enrollmentStats}
        semester={calendar?.semester ?? "2026/1"}
        registrationOpen={calendar?.registration_open !== false}
        recentEnrollments={(recentEnrollments ?? []).map(normalizeEnrollmentRow)}
        topCourses={topCourses}
      />
    </DashboardLayout>
  );
}
