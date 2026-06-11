import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm } from "@/components/staff/course-form";
import { CoursesList } from "@/components/staff/courses-list";
import { fetchLecturerOptions } from "@/lib/staff";
import { getEnrollmentCountsByCourse, mergeEnrollmentCounts } from "@/lib/enrollment-count";

export default async function StaffCoursesPage() {
  const profile = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const [{ data: courses }, { data: programmes }, staff, enrollmentCounts] = await Promise.all([
    supabase
      .from("courses")
      .select("*, programmes(code, name)")
      .order("code"),
    supabase.from("programmes").select("*").eq("is_active", true),
    fetchLecturerOptions(supabase),
    getEnrollmentCountsByCourse(supabase),
  ]);

  const coursesWithCounts = mergeEnrollmentCounts(courses ?? [], enrollmentCounts);

  return (
    <DashboardLayout profile={profile} title="Course Management">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Add New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm programmes={programmes ?? []} staff={staff} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Courses ({coursesWithCounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CoursesList courses={coursesWithCounts} staff={staff} showDelete />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
