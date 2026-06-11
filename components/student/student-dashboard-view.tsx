import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { DAY_NAMES, type Faculty, type Programme, type Timetable } from "@/types/database";
import {
  BookOpen,
  CreditCard,
  Calendar,
  Receipt,
  GraduationCap,
  ArrowRight,
  Clock,
  User,
  MapPin,
  CircleCheck,
  CircleX,
  Settings,
  Layers,
} from "lucide-react";

interface EnrollmentRow {
  id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  courses?: { code?: string; name?: string; credit_hours?: number; lecturer?: string } | null;
}

interface CourseRow {
  id: string;
  code: string;
  name: string;
  credit_hours: number;
  lecturer: string | null;
  capacity: number;
  enrolled_count: number;
}

interface PaymentRow {
  amount: number;
  status: string;
  receipt_number: string | null;
}

interface TimetableSlot extends Omit<Timetable, "courses"> {
  courses?: { code?: string; name?: string } | null;
}

interface StudentDashboardViewProps {
  programme: (Programme & { faculties?: Faculty }) | undefined;
  programmeId: string;
  semester: string;
  registrationOpen: boolean;
  enrollmentCount: number;
  pendingCount: number;
  openCourseCount: number;
  totalCredits: number;
  activeEnrollments: EnrollmentRow[];
  browseCourses: CourseRow[];
  latestPayment: PaymentRow | null;
  timetableSlots: TimetableSlot[];
}

const QUICK_LINKS = [
  { href: "/student/enrollment", label: "My Enrollments", icon: GraduationCap, desc: "Track status" },
  { href: "/student/fees", label: "Fees & Payment", icon: CreditCard, desc: "Pay & receipts" },
  { href: "/student/timetable", label: "Timetable", icon: Calendar, desc: "Weekly schedule" },
  { href: "/student/settings", label: "Settings", icon: Settings, desc: "Profile & account" },
];

export function StudentDashboardView({
  programme,
  programmeId,
  semester,
  registrationOpen,
  enrollmentCount,
  pendingCount,
  openCourseCount,
  totalCredits,
  activeEnrollments,
  browseCourses,
  latestPayment,
  timetableSlots,
}: StudentDashboardViewProps) {
  const facultyName = programme?.faculties?.name;
  const levelLabel = programme?.level
    ? programme.level.charAt(0).toUpperCase() + programme.level.slice(1)
    : null;

  const todayIndex = new Date().getDay();
  const todaySlots = timetableSlots.filter((s) => s.day_of_week === todayIndex);
  const upcomingSlots = timetableSlots.slice(0, 5);

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Enrolled Courses"
          value={enrollmentCount}
          icon={GraduationCap}
          href="/student/enrollment"
          accent="blue"
        />
        <StatCard
          label="Pending Payment"
          value={pendingCount}
          icon={CreditCard}
          href="/student/fees"
          accent="amber"
        />
        <StatCard
          label="Open Courses"
          value={openCourseCount}
          icon={BookOpen}
          href="/student/courses"
          accent="green"
        />
        <StatCard
          label="Credit Hours"
          value={totalCredits}
          icon={Layers}
          href="/student/enrollment"
          accent="sky"
        />
      </div>

      {!registrationOpen && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/30">
          <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">Registration Closed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New course enrollment is not available right now. Contact the registrar for assistance.
            </p>
          </div>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-slate-50 p-6 dark:border-sky-900 dark:from-sky-950/40 dark:to-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-sky-900 dark:text-sky-300">Payment Required</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {pendingCount} unpaid enrollment{pendingCount !== 1 ? "s" : ""} — complete payment within 3 days.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/student/fees">Proceed to Payment</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                My Enrollments
              </CardTitle>
              {activeEnrollments.length > 0 && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/student/enrollment">
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {activeEnrollments.length > 0 ? (
                <ul className="space-y-3">
                  {activeEnrollments.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          <span className="text-primary">{e.courses?.code}</span> — {e.courses?.name}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>{e.courses?.credit_hours ?? 0} credits</span>
                          {e.courses?.lecturer && (
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {e.courses.lecturer}
                            </span>
                          )}
                          <span>Enrolled {formatDate(e.enrolled_at)}</span>
                        </div>
                      </div>
                      <StatusBadge status={e.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={GraduationCap}
                  title="No enrollments yet"
                  description="Browse available courses for your programme and enroll to get started."
                  action={
                    <Button asChild size="sm">
                      <Link href="/student/courses">Browse Courses</Link>
                    </Button>
                  }
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                {todaySlots.length > 0 ? "Today's Classes" : "Upcoming Schedule"}
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/student/timetable">
                  Full timetable
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {(todaySlots.length > 0 ? todaySlots : upcomingSlots).length > 0 ? (
                <ul className="space-y-3">
                  {(todaySlots.length > 0 ? todaySlots : upcomingSlots).map((slot) => (
                    <li
                      key={slot.id}
                      className="flex items-start gap-3 rounded-xl border bg-card/60 p-4"
                    >
                      <div className="rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-center text-xs font-semibold text-violet-700 dark:text-violet-300">
                        {DAY_NAMES[slot.day_of_week]?.slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {(slot.courses as { code?: string })?.code} — {(slot.courses as { name?: string })?.name}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </span>
                          {slot.venue && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {slot.venue}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No classes scheduled"
                  description="Enroll and pay for courses to build your weekly timetable."
                  action={
                    <Button asChild size="sm" variant="outline">
                      <Link href="/student/timetable">View Timetable</Link>
                    </Button>
                  }
                  className="py-8"
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Browse More Courses</CardTitle>
              {browseCourses.length > 0 && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/student/courses">
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {browseCourses.length > 0 ? (
                <ul className="space-y-3">
                  {browseCourses.map((course) => {
                    const seatsLeft = Math.max(course.capacity - course.enrolled_count, 0);
                    return (
                      <li
                        key={course.id}
                        className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">
                            <span className="text-primary">{course.code}</span> — {course.name}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.credit_hours} credits
                            </span>
                            {course.lecturer && (
                              <span className="inline-flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {course.lecturer}
                              </span>
                            )}
                            <span>{seatsLeft} seats left</span>
                          </div>
                        </div>
                        <Button asChild size="sm" className="shrink-0" disabled={!registrationOpen}>
                          <Link href="/student/courses">{registrationOpen ? "Enroll" : "Closed"}</Link>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title={
                    programmeId
                      ? enrollmentCount > 0
                        ? "You're enrolled in available courses"
                        : "No courses this semester"
                      : "Programme not assigned"
                  }
                  description={
                    programmeId
                      ? "Check back later or browse the full course catalogue."
                      : "Contact admin to assign your programme."
                  }
                  action={
                    programmeId ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/student/courses">Browse Courses</Link>
                      </Button>
                    ) : undefined
                  }
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
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Semester</p>
                  <p className="mt-0.5 font-semibold text-foreground">{semester}</p>
                </div>
                <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                {registrationOpen ? (
                  <CircleCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <CircleX className="h-5 w-5 shrink-0 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Registration {registrationOpen ? "Open" : "Closed"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {registrationOpen ? "You can enroll in open courses" : "Enrollment paused"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Programme Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {programme ? (
                <>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Programme</p>
                    <p className="mt-1 font-semibold text-foreground">{programme.code}</p>
                    <p className="text-sm text-muted-foreground">{programme.name}</p>
                  </div>
                  {facultyName && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Faculty</p>
                      <p className="mt-1 text-sm">{facultyName}</p>
                    </div>
                  )}
                  {levelLabel && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Level</p>
                      <p className="mt-1 text-sm">{levelLabel}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration</p>
                    <p className="mt-1 text-sm">{programme.duration_years} year(s)</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No programme assigned to your account.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Latest Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {latestPayment ? (
                <div className="rounded-xl bg-emerald-50 p-5 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/50">
                      <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(Number(latestPayment.amount))}
                      </p>
                      <p className="text-sm text-emerald-600/80 dark:text-emerald-500/80">
                        Receipt: {latestPayment.receipt_number}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={latestPayment.status} className="mt-3" />
                </div>
              ) : (
                <EmptyState
                  icon={Receipt}
                  title="No payments yet"
                  description="Payment history appears here after your first transaction."
                  className="py-6"
                />
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
