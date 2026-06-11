import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { getEnrollmentCountForCourse } from "@/lib/enrollment-count";
import { formatDate } from "@/lib/utils";
import { TableScroll } from "@/components/shared/table-scroll";

export default async function CourseRosterPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  const profile = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, programmes(code, name)")
    .eq("id", params.id)
    .single();

  if (!course) notFound();

  const fromCourses = searchParams.from === "courses";
  const backHref = fromCourses ? "/staff/courses" : "/staff/my-courses";
  const backLabel = fromCourses ? "Back to Courses" : "Back to My Courses";
  const timetableHref = fromCourses
    ? `/staff/my-courses/${params.id}/timetable?from=courses`
    : `/staff/my-courses/${params.id}/timetable`;

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, profiles(full_name, student_id, email)")
    .eq("course_id", params.id)
    .in("status", ["paid", "confirmed", "pending"])
    .order("enrolled_at");

  const roster = enrollments ?? [];
  const enrolledCount = await getEnrollmentCountForCourse(supabase, params.id);

  return (
    <DashboardLayout profile={profile} title="Class Roster">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={timetableHref}>
            <Calendar className="mr-2 h-4 w-4" />
            Manage timetable
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {course.code} — {course.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {(course.programmes as { code?: string })?.code} · Lecturer: {course.lecturer ?? "—"} ·{" "}
            {enrolledCount}/{course.capacity} enrolled
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Class Roster ({roster.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {roster.length > 0 ? (
            <TableScroll minWidth="40rem">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">Student ID</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Enrolled</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((e) => {
                    const student = e.profiles as {
                      full_name?: string;
                      student_id?: string;
                      email?: string;
                    };
                    return (
                      <tr key={e.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-medium">{student?.full_name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{student?.student_id}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{student?.email}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {formatDate(e.enrolled_at)}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={e.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableScroll>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No students enrolled yet.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
