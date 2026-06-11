import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { CourseCapacityRow } from "@/components/shared/course-capacity-row";
import { EnrollmentListItem } from "@/components/shared/enrollment-list-item";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Settings,
  BarChart3,
  Download,
  ArrowRight,
  Activity,
  GraduationCap,
  Shield,
  UserCog,
  CircleCheck,
  CircleX,
  ClipboardList,
  TrendingUp,
  User,
} from "lucide-react";

interface EnrollmentStats {
  pending: number;
  paid: number;
  confirmed: number;
  cancelled: number;
}

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  receipt_number: string | null;
  paid_at: string | null;
  created_at: string;
  profiles?: { full_name?: string; student_id?: string } | null;
}

interface AuditRow {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  profiles?: { full_name?: string } | null;
}

interface CourseRow {
  id: string;
  code: string;
  name: string;
  capacity: number;
  enrolled_count: number;
  lecturer: string | null;
}

interface EnrollmentRow {
  id: string;
  status: string;
  enrolled_at: string;
  profiles?: { full_name?: string; student_id?: string } | null;
  courses?: { code?: string; name?: string } | null;
}

interface AdminDashboardViewProps {
  userCount: number;
  courseCount: number;
  activeCourseCount: number;
  totalRevenue: number;
  auditCount: number;
  enrollmentStats: EnrollmentStats;
  roleCounts: { student: number; staff: number; lecturer: number; admin: number };
  inactiveUserCount: number;
  registrationOpen: boolean;
  semester: string;
  revenueBreakdown: { tuition: number; registration: number; resource: number };
  recentPayments: PaymentRow[];
  auditLogs: AuditRow[];
  topCourses: CourseRow[];
  recentEnrollments: EnrollmentRow[];
}

const ENROLLMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  paid: "bg-sky-500",
  confirmed: "bg-emerald-500",
  cancelled: "bg-slate-400",
};

const QUICK_LINKS = [
  { href: "/admin/users", label: "Manage Users", icon: Users, desc: "Roles & accounts" },
  { href: "/admin/config", label: "Configuration", icon: Settings, desc: "Calendar & fees" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, desc: "Analytics & exports" },
  { href: "/staff/courses", label: "Courses", icon: BookOpen, desc: "Course catalogue" },
];

export function AdminDashboardView({
  userCount,
  courseCount,
  activeCourseCount,
  totalRevenue,
  auditCount,
  enrollmentStats,
  roleCounts,
  inactiveUserCount,
  registrationOpen,
  semester,
  revenueBreakdown,
  recentPayments,
  auditLogs,
  topCourses,
  recentEnrollments,
}: AdminDashboardViewProps) {
  const enrollmentTotal = Object.values(enrollmentStats).reduce((s, n) => s + n, 0);
  const pendingEnrollments = enrollmentStats.pending;

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={userCount} icon={Users} href="/admin/users" accent="blue" />
        <StatCard label="Active Courses" value={activeCourseCount} icon={BookOpen} href="/staff/courses" accent="sky" />
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={CreditCard} href="/admin/reports" accent="green" />
        <StatCard label="Audit Events" value={auditCount} icon={FileText} href="/admin/reports" accent="amber" />
      </div>

      {!registrationOpen && (
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-900/50">
              <CircleX className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">Registration Closed</p>
              <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
                Students cannot enroll until registration is reopened in configuration.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0 border-amber-300 dark:border-amber-700">
            <Link href="/admin/config">Open Settings</Link>
          </Button>
        </div>
      )}

      <DashboardCharts
        enrollmentStats={enrollmentStats}
        roleCounts={roleCounts}
        revenueBreakdown={revenueBreakdown}
        totalRevenue={totalRevenue}
      />

      {pendingEnrollments > 0 && (
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-slate-50 p-6 dark:border-sky-900 dark:from-sky-950/40 dark:to-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-sky-100 p-2.5 dark:bg-sky-900/50">
              <GraduationCap className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="font-semibold text-sky-900 dark:text-sky-200">
                {pendingEnrollments} Pending Enrollment{pendingEnrollments !== 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Awaiting student payment or staff confirmation.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/staff/students">Review Enrollments</Link>
          </Button>
        </div>
      )}

      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ClipboardList className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
                Enrollment Overview
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="w-fit shrink-0 self-start sm:self-auto">
                <Link href="/admin/reports">
                  Full report
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentTotal > 0 ? (
                Object.entries(enrollmentStats).map(([status, count]) => {
                  const pct = Math.round((count / enrollmentTotal) * 100);
                  return (
                    <div key={status}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 capitalize">
                          <StatusBadge status={status} />
                          <span className="text-muted-foreground">{pct}%</span>
                        </span>
                        <span className="font-semibold text-foreground">{count}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${ENROLLMENT_COLORS[status] ?? "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon={GraduationCap}
                  title="No enrollments yet"
                  description="Enrollment data will appear here once students start registering."
                  className="py-10"
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base sm:text-lg">Recent Payments</CardTitle>
              <Button asChild variant="ghost" size="sm" className="w-fit shrink-0 self-start sm:self-auto">
                <Link href="/admin/reports">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 pb-2">
              {recentPayments.length > 0 ? (
                <ul className="divide-y divide-border/50">
                  {recentPayments.map((p) => {
                    const student = p.profiles;
                    return (
                      <li
                        key={p.id}
                        className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-medium leading-snug">{student?.full_name ?? "—"}</p>
                          <p className="break-words text-xs text-muted-foreground">
                            {student?.student_id ?? "—"} · {p.receipt_number ?? "No receipt"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(Number(p.amount))}
                          </p>
                          <StatusBadge status={p.status} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  icon={CreditCard}
                  title="No payments yet"
                  description="Payment transactions will show here after students complete fees."
                  className="mx-4 mb-4 py-10"
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Popular Courses
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="w-fit shrink-0 self-start sm:self-auto">
                <Link href="/staff/courses">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {topCourses.length > 0 ? (
                <ul className="space-y-3">
                  {topCourses.map((course) => (
                    <li
                      key={course.id}
                      className="rounded-xl border bg-muted/30 p-3 transition-colors hover:bg-muted/50 sm:p-4"
                    >
                      <CourseCapacityRow
                        code={course.code}
                        name={course.name}
                        enrolledCount={course.enrolled_count}
                        capacity={course.capacity}
                        lecturer={course.lecturer}
                        showMeta
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No active courses"
                  description="Courses will appear here once they are added to the system."
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <GraduationCap className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
                Recent Enrollments
              </CardTitle>
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
                      variant="admin"
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={GraduationCap}
                  title="No enrollments yet"
                  description="New student enrollments will show up here in real time."
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Semester</p>
                  <p className="mt-0.5 break-words font-semibold text-foreground">{semester}</p>
                </div>
                <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
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
                    {registrationOpen ? "Students can enroll" : "Enrollment disabled"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="rounded-xl border bg-card px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{activeCourseCount}</p>
                  <p className="text-xs text-muted-foreground">Active courses</p>
                </div>
                <div className="rounded-xl border bg-card px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{courseCount}</p>
                  <p className="text-xs text-muted-foreground">Total courses</p>
                </div>
              </div>

              {inactiveUserCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {inactiveUserCount} deactivated account{inactiveUserCount !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Users by Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { role: "Students", count: roleCounts.student, icon: GraduationCap, color: "text-sky-600 dark:text-sky-400" },
                { role: "Staff", count: roleCounts.staff, icon: UserCog, color: "text-emerald-600 dark:text-emerald-400" },
                { role: "Lecturers", count: roleCounts.lecturer, icon: User, color: "text-amber-600 dark:text-amber-400" },
                { role: "Admins", count: roleCounts.admin, icon: Shield, color: "text-violet-600 dark:text-violet-400" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.role}
                    className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${row.color}`} />
                      <span className="text-sm font-medium">{row.role}</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{row.count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-orange-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <ul className="space-y-2">
                  {auditLogs.map((log) => (
                    <li
                      key={log.id}
                      className="rounded-lg border bg-card/60 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
                    >
                      <p className="font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {(log.profiles as { full_name?: string })?.full_name ?? "System"} ·{" "}
                        {formatDateTime(log.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No activity yet"
                  description="System audit logs will appear here."
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm"
                  >
                    <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/15">
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
              <a
                href="/api/admin/export?type=enrollments"
                className="group flex items-center gap-3 rounded-xl border border-dashed bg-card px-4 py-3 transition-all hover:border-primary/30 hover:bg-muted/50"
              >
                <div className="rounded-lg bg-muted p-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">Export Data</p>
                  <p className="text-xs text-muted-foreground">Download enrollments CSV</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
