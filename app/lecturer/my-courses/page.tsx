import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoursesList } from "@/components/staff/courses-list";
import { filterMyCourses } from "@/lib/lecturer";
import { getEnrollmentCountsByCourse, mergeEnrollmentCounts } from "@/lib/enrollment-count";

export default async function LecturerMyCoursesPage() {
  const profile = await requireRole(["lecturer", "admin"]);
  const supabase = await createClient();

  const [{ data: courses }, enrollmentCounts] = await Promise.all([
    supabase
      .from("courses")
      .select("*, programmes(code, name)")
      .eq("is_active", true)
      .order("code"),
    getEnrollmentCountsByCourse(supabase),
  ]);

  const myCourses = filterMyCourses(mergeEnrollmentCounts(courses ?? [], enrollmentCounts), profile);
  const isAdminView = profile.role === "admin";

  return (
    <DashboardLayout profile={profile} title="My Courses">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isAdminView ? "All Active Courses" : "My Teaching Assignments"} ({myCourses.length})
          </CardTitle>
          {!isAdminView && (
            <p className="text-sm text-muted-foreground">
              Courses where you are assigned as lecturer ({profile.full_name})
            </p>
          )}
        </CardHeader>
        <CardContent>
          {myCourses.length > 0 ? (
            <CoursesList
              courses={myCourses}
              variant="teach"
              portalPath="/lecturer"
              rosterSource="my-courses"
            />
          ) : (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No courses assigned yet. Registrar staff will assign you as lecturer on relevant courses.
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
