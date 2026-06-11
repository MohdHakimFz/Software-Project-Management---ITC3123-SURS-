import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PageBanner } from "@/components/shared/page-banner";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { Button } from "@/components/ui/button";
import { Users, Settings, BarChart3, Download } from "lucide-react";
import { getEnrollmentCountsByCourse, mergeEnrollmentCounts } from "@/lib/enrollment-count";
import {
  normalizeAuditRow,
  normalizeEnrollmentRow,
  normalizeProfileRow,
} from "@/lib/normalize-relations";

export default async function AdminDashboardPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: courseCount },
    { count: activeCourseCount },
    { data: payments },
    { count: auditCount },
    { data: enrollments },
    { data: profiles },
    { data: config },
    { data: recentPayments },
    { data: auditLogs },
    { data: topCourses },
    { data: recentEnrollments },
    enrollmentCounts,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("payments")
      .select("amount, tuition_amount, registration_amount, resource_amount")
      .eq("status", "paid"),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("status"),
    supabase.from("profiles").select("role, is_active"),
    supabase.from("system_config").select("key, value"),
    supabase
      .from("payments")
      .select("*, profiles(full_name, student_id)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("audit_logs")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("courses")
      .select("id, code, name, capacity, enrolled_count, lecturer")
      .eq("is_active", true)
      .order("enrolled_count", { ascending: false })
      .limit(5),
    supabase
      .from("enrollments")
      .select("id, status, enrolled_at, profiles(full_name, student_id), courses(code, name)")
      .order("enrolled_at", { ascending: false })
      .limit(6),
    getEnrollmentCountsByCourse(supabase),
  ]);

  const topCoursesWithCounts = mergeEnrollmentCounts(topCourses ?? [], enrollmentCounts).sort(
    (a, b) => b.enrolled_count - a.enrolled_count
  );

  const paidPayments = payments ?? [];
  const totalRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const revenueBreakdown = paidPayments.reduce(
    (acc, p) => ({
      tuition: acc.tuition + Number(p.tuition_amount),
      registration: acc.registration + Number(p.registration_amount),
      resource: acc.resource + Number(p.resource_amount),
    }),
    { tuition: 0, registration: 0, resource: 0 }
  );

  const enrollmentStats = {
    pending: enrollments?.filter((e) => e.status === "pending").length ?? 0,
    paid: enrollments?.filter((e) => e.status === "paid").length ?? 0,
    confirmed: enrollments?.filter((e) => e.status === "confirmed").length ?? 0,
    cancelled: enrollments?.filter((e) => e.status === "cancelled").length ?? 0,
  };

  const roleCounts = {
    student: profiles?.filter((p) => p.role === "student").length ?? 0,
    staff: profiles?.filter((p) => p.role === "staff").length ?? 0,
    lecturer: profiles?.filter((p) => p.role === "lecturer").length ?? 0,
    admin: profiles?.filter((p) => p.role === "admin").length ?? 0,
  };

  const inactiveUserCount = profiles?.filter((p) => p.is_active === false).length ?? 0;

  const calendar = config?.find((c) => c.key === "academic_calendar")?.value as {
    semester?: string;
    registration_open?: boolean;
  } | undefined;

  const firstName = profile.full_name.split(" ")[0];

  return (
    <DashboardLayout profile={profile} title="Admin Dashboard">
      <PageBanner
        badge={calendar?.semester ?? "System Admin"}
        title={`Welcome back, ${firstName}`}
        subtitle="Monitor registrations, revenue, users, and system health at a glance."
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <Link href="/admin/config">
              <Settings className="mr-2 h-4 w-4" />
              Config
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <Link href="/admin/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
            <a href="/api/admin/export?type=payments">
              <Download className="mr-2 h-4 w-4" />
              Export
            </a>
          </Button>
        </div>
      </PageBanner>

      <AdminDashboardView
        userCount={userCount ?? 0}
        courseCount={courseCount ?? 0}
        activeCourseCount={activeCourseCount ?? 0}
        totalRevenue={totalRevenue}
        auditCount={auditCount ?? 0}
        enrollmentStats={enrollmentStats}
        roleCounts={roleCounts}
        inactiveUserCount={inactiveUserCount}
        registrationOpen={calendar?.registration_open !== false}
        semester={calendar?.semester ?? "2026/1"}
        revenueBreakdown={revenueBreakdown}
        recentPayments={(recentPayments ?? []).map(normalizeProfileRow)}
        auditLogs={(auditLogs ?? []).map(normalizeAuditRow)}
        topCourses={topCoursesWithCounts}
        recentEnrollments={(recentEnrollments ?? []).map(normalizeEnrollmentRow)}
      />
    </DashboardLayout>
  );
}
