import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentsList } from "@/components/staff/enrollments-list";

export default async function StaffStudentsPage() {
  const profile = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const [{ data: students }, { data: enrollments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, programmes(code, name)")
      .eq("role", "student")
      .order("full_name"),
    supabase
      .from("enrollments")
      .select("*, courses(code, name), profiles(full_name, student_id)")
      .order("enrolled_at", { ascending: false }),
  ]);

  return (
    <DashboardLayout profile={profile} title="Student Management">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registered Students ({students?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[28rem] space-y-3 overflow-y-auto">
              {students?.map((s) => (
                <div key={s.id} className="rounded-lg border p-3">
                  <p className="font-medium">{s.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.student_id} · {s.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(s.programmes as { code?: string })?.code ?? "No programme"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentsList enrollments={enrollments ?? []} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
