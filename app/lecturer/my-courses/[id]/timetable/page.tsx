import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canLecturerAccessCourse } from "@/lib/lecturer-access";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimetableEditor } from "@/components/staff/timetable-editor";
import { getEnrollmentCountForCourse } from "@/lib/enrollment-count";
import { ArrowLeft, Users } from "lucide-react";
import type { Timetable } from "@/types/database";

export default async function LecturerCourseTimetablePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireRole(["lecturer", "admin"]);
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, programmes(code, name)")
    .eq("id", params.id)
    .single();

  if (!course || !canLecturerAccessCourse(profile, course)) notFound();

  const [{ data: slots }, enrolledCount] = await Promise.all([
    supabase
      .from("timetables")
      .select("*")
      .eq("course_id", params.id)
      .order("day_of_week")
      .order("start_time"),
    getEnrollmentCountForCourse(supabase, params.id),
  ]);

  return (
    <DashboardLayout profile={profile} title="Course Timetable">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/lecturer/my-courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Courses
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/lecturer/my-courses/${params.id}`}>
            <Users className="mr-2 h-4 w-4" />
            Class roster
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {course.code} — {course.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {(course.programmes as { code?: string })?.code} · {enrolledCount}/{course.capacity} enrolled
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Class schedule</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set your weekly class times and venue. Enrolled students see updates on their timetable.
          </p>
        </CardHeader>
        <CardContent>
          <TimetableEditor
            courseId={course.id}
            courseCode={course.code}
            enrolledCount={enrolledCount}
            initialSlots={(slots ?? []) as Timetable[]}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
