import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PageBanner } from "@/components/shared/page-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { filterMyCourses } from "@/lib/lecturer";
import { getEnrollmentCountsByCourse, mergeEnrollmentCounts } from "@/lib/enrollment-count";
import { BookMarked, Calendar, Users, ArrowRight } from "lucide-react";

export default async function LecturerDashboardPage() {
  const profile = await requireRole(["lecturer", "admin"]);
  const supabase = await createClient();

  const [{ data: courses }, enrollmentCounts] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, name, capacity, enrolled_count, lecturer, semester")
      .eq("is_active", true)
      .order("code"),
    getEnrollmentCountsByCourse(supabase),
  ]);

  const myCourses = filterMyCourses(mergeEnrollmentCounts(courses ?? [], enrollmentCounts), profile);
  const firstName = profile.full_name.split(" ")[0];

  return (
    <DashboardLayout profile={profile} title="My Teaching">
      <PageBanner
        badge="Teaching Portal"
        title={`Welcome, ${firstName}`}
        subtitle="View your assigned classes, student rosters, and class timetables."
      >
        <Button asChild size="sm" variant="secondary" className="border-0 bg-white/15 text-white hover:bg-white/25">
          <Link href="/lecturer/my-courses">
            <BookMarked className="mr-2 h-4 w-4" />
            My Courses
          </Link>
        </Button>
      </PageBanner>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">My Assigned Courses ({myCourses.length})</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/lecturer/my-courses">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {myCourses.length > 0 ? (
            <ul className="space-y-3">
              {myCourses.map((course) => (
                <li
                  key={course.id}
                  className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {course.code} — {course.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.enrolled_count}/{course.capacity} enrolled · {course.semester}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/lecturer/my-courses/${course.id}`}>
                        <Users className="mr-1 h-3.5 w-3.5" />
                        Roster
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/lecturer/my-courses/${course.id}/timetable`}>
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        Timetable
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              No courses assigned yet. Ask registrar staff to set you as lecturer when creating a course.
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
