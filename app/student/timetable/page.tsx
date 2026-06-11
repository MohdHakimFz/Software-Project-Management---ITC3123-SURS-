import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { detectConflicts } from "@/lib/timetable";
import { DAY_NAMES } from "@/types/database";
import { formatTime } from "@/lib/utils";
import { AlertTriangle, Calendar, MapPin, Clock, CreditCard } from "lucide-react";
import type { Timetable } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAY_COLORS = [
  "from-blue-500/10 border-blue-200 dark:border-blue-900",
  "from-uptm-blue/10 border-uptm-blue/20",
  "from-emerald-500/10 border-emerald-200 dark:border-emerald-900",
  "from-orange-500/10 border-orange-200 dark:border-orange-900",
  "from-purple-500/10 border-purple-200 dark:border-purple-900",
  "from-rose-500/10 border-rose-200 dark:border-rose-900",
  "from-slate-500/10 border-slate-200 dark:border-slate-800",
];

const ACTIVE_STATUSES = ["pending", "paid", "confirmed"];

export default async function StudentTimetablePage() {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, status, courses(code, name)")
    .eq("student_id", profile.id)
    .in("status", ACTIVE_STATUSES);

  const activeEnrollments = enrollments ?? [];
  const courseIds = activeEnrollments.map((e) => e.course_id);
  const pendingOnly =
    activeEnrollments.length > 0 && activeEnrollments.every((e) => e.status === "pending");

  let timetables: Timetable[] = [];
  if (courseIds.length > 0) {
    const { data } = await supabase
      .from("timetables")
      .select("*, courses(code, name)")
      .in("course_id", courseIds)
      .order("day_of_week")
      .order("start_time");
    timetables = (data ?? []) as Timetable[];
  }

  const coursesWithoutSlots = activeEnrollments.filter(
    (e) => !timetables.some((t) => t.course_id === e.course_id)
  );

  const conflicts = detectConflicts(timetables);

  const byDay = DAY_NAMES.map((day, index) => ({
    day,
    index,
    slots: timetables.filter((t) => t.day_of_week === index),
  }));

  return (
    <DashboardLayout profile={profile} title="My Timetable">
      {pendingOnly && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">Payment pending</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your timetable preview is shown below. Complete payment to confirm enrollment.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/student/fees">Pay Now</Link>
          </Button>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 shadow-sm dark:border-red-900 dark:from-red-950/40 dark:to-orange-950/30">
          <div className="rounded-xl bg-red-100 p-2 dark:bg-red-900/50">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-800 dark:text-red-200">Schedule Conflicts Detected</p>
            {conflicts.map((c, i) => (
              <p key={i} className="mt-1 text-sm text-red-700 dark:text-red-300">
                {c.course1} and {c.course2} overlap on {c.day} ({c.time})
              </p>
            ))}
          </div>
        </div>
      )}

      {activeEnrollments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No timetable yet"
          description="Enroll in courses to see your weekly schedule here."
          action={
            <Button asChild>
              <Link href="/student/courses">Browse Courses</Link>
            </Button>
          }
        />
      ) : timetables.length === 0 ? (
        <div className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-900 dark:text-amber-200">
                Schedule not published yet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You are enrolled in the course(s) below, but class times have not been added to the
                system yet. Please check back later or contact the registrar.
              </p>
              <ul className="mt-4 space-y-2">
                {activeEnrollments.map((e) => (
                  <li
                    key={e.course_id}
                    className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium">
                      {(e.courses as { code?: string })?.code} — {(e.courses as { name?: string })?.name}
                    </span>
                    <StatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {coursesWithoutSlots.length > 0 && (
            <Card className="mb-6 border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Courses awaiting schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {coursesWithoutSlots.map((e) => (
                    <li key={e.course_id}>
                      {(e.courses as { code?: string })?.code} — {(e.courses as { name?: string })?.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {byDay
              .filter((d) => d.slots.length > 0)
              .map(({ day, index, slots }) => (
                <div
                  key={day}
                  className={`interactive-card overflow-hidden border bg-gradient-to-br to-card ${DAY_COLORS[index]}`}
                >
                  <div className="border-b bg-card/50 px-5 py-4">
                    <h3 className="font-bold text-foreground">{day}</h3>
                    <p className="text-xs text-muted-foreground">
                      {slots.length} class{slots.length > 1 ? "es" : ""}
                    </p>
                  </div>
                  <div className="space-y-3 p-4">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-xl border bg-card p-4 shadow-sm transition-transform hover:scale-[1.02]"
                      >
                        <p className="font-bold text-primary">
                          {(slot.courses as { code?: string })?.code}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {(slot.courses as { name?: string })?.name}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" />
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" />
                            {slot.venue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
