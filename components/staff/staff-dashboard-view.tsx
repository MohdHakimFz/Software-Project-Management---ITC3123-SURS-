import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DonutChart } from "@/components/shared/donut-chart";
import { CourseCapacityRow } from "@/components/shared/course-capacity-row";
import { EnrollmentListItem } from "@/components/shared/enrollment-list-item";
import {
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  CircleCheck,
  CircleX,
  User,
  TrendingUp,
} from "lucide-react";

interface EnrollmentStats {
  pending: number;
  paid: number;
  confirmed: number;
  cancelled: number;
}

interface EnrollmentRow {
  id: string;
  status: string;
  enrolled_at: string;
  profiles?: { full_name?: string; student_id?: string } | null;
  courses?: { code?: string; name?: string } | null;
}

interface CourseRow {
  id: string;
  code: string;
  name: string;
  capacity: number;
  enrolled_count: number;
  lecturer: string | null;
}

interface StaffDashboardViewProps {
  studentCount: number;
  courseCount: number;
  pendingCount: number;
  confirmedCount: number;
  enrollmentStats: EnrollmentStats;
  semester: string;
  registrationOpen: boolean;
  recentEnrollments: EnrollmentRow[];
  topCourses: CourseRow[];
}

const ENROLLMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  paid: "bg-sky-500",
  confirmed: "bg-emerald-500",
  cancelled: "bg-slate-400",
};

const QUICK_LINKS = [
  { href: "/staff/students", label: "Students", icon: Users, desc: "Registrations & enrollments" },
  { href: "/staff/courses", label: "Courses", icon: BookOpen, desc: "Manage catalogue & timetables" },
  { href: "/staff/settings", label: "Settings", icon: User, desc: "Account profile" },
];

export function StaffDashboardView({
  studentCount,
  courseCount,
  pendingCount,
  confirmedCount,
  enrollmentStats,
  semester,
  registrationOpen,
  recentEnrollments,
  topCourses,
}: StaffDashboardViewProps) {
  const enrollmentTotal = Object.values(enrollmentStats).reduce((s, n) => s + n, 0);

  const donutSegments = [
    { key: "pending", label: "Pending", value: enrollmentStats.pending, color: "#f59e0b" },
    { key: "paid", label: "Paid", value: enrollmentStats.paid, color: "#0ea5e9" },
    { key: "confirmed", label: "Confirmed", value: enrollmentStats.confirmed, color: "#10b981" },
    { key: "cancelled", label: "Cancelled", value: enrollmentStats.cancelled, color: "#94a3b8" },
  ].filter((s) => s.value > 0);

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={studentCount} icon={Users} href="/staff/students" accent="blue" />
        <StatCard label="Active Courses" value={courseCount} icon={BookOpen} href="/staff/courses" accent="sky" />
        <StatCard label="Pending Enrollments" value={pendingCount} icon={GraduationCap} href="/staff/students" accent="amber" />
        <StatCard label="Confirmed" value={confirmedCount} icon={CheckCircle2} href="/staff/students" accent="green" />
      </div>

      {!registrationOpen && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/30">
          <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">Registration Closed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Students cannot enroll until registration is reopened by admin.
            </p>
          </div>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-slate-50 p-6 dark:border-sky-900 dark:from-sky-950/40 dark:to-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-sky-900 dark:text-sky-200">
              {pendingCount} enrollment{pendingCount !== 1 ? "s" : ""} awaiting payment
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Review student enrollments and follow up on pending payments.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/staff/students">Review Enrollments</Link>
          </Button>
        </div>
      )}

      <div className="mb-8 grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-md lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              Enrollment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {donutSegments.length > 0 ? (
              <DonutChart segments={donutSegments} total={enrollmentTotal} centerLabel="total" />
            ) : (
              <EmptyState
                icon={GraduationCap}
                title="No enrollments"
                description="Enrollment data will appear here."
                className="py-8"
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Course Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCourses.length > 0 ? (
              topCourses.map((course) => (
                <CourseCapacityRow
                  key={course.id}
                  code={course.code}
                  name={course.name}
                  enrolledCount={course.enrolled_count}
                  capacity={course.capacity}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No course data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base sm:text-lg">Recent Enrollments</CardTitle>
              <Button asChild variant="ghost" size="sm" className="w-fit shrink-0 self-start sm:self-auto">
                <Link href="/staff/students">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentEnrollments.length > 0 ? (
                <ul className="space-y-2">
                  {recentEnrollments.map((e) => (
                    <EnrollmentListItem
                      key={e.id}
                      id={e.id}
                      status={e.status}
                      enrolledAt={e.enrolled_at}
                      studentName={e.profiles?.full_name}
                      studentId={e.profiles?.student_id}
                      courseCode={e.courses?.code}
                      courseName={e.courses?.name}
                      variant="staff"
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={GraduationCap}
                  title="No enrollments yet"
                  description="New student enrollments will appear here."
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Semester Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Semester</p>
                  <p className="mt-0.5 break-words font-semibold text-foreground">{semester}</p>
                </div>
                <span className="w-fit shrink-0 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                  Active
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-xl border bg-muted/30 px-3 py-3 sm:px-4">
                {registrationOpen ? (
                  <CircleCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <CircleX className="h-5 w-5 shrink-0 text-amber-500" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Registration {registrationOpen ? "Open" : "Closed"}
                  </p>
                  <p className="break-words text-xs text-muted-foreground">
                    {studentCount} student{studentCount !== 1 ? "s" : ""} · {courseCount} active courses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Enrollment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {enrollmentTotal > 0 ? (
                Object.entries(enrollmentStats).map(([status, count]) => {
                  const pct = Math.round((count / enrollmentTotal) * 100);
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 capitalize">
                          <StatusBadge status={status} />
                          <span className="text-muted-foreground">{pct}%</span>
                        </span>
                        <span className="font-semibold text-foreground">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${ENROLLMENT_COLORS[status] ?? "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No enrollment records yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all hover:border-primary/30 hover:bg-muted/50"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
